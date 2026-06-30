const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const category = req.query.category ? { category: req.query.category } : {};
    const filter = { ...keyword, ...category, isActive: true };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    const isAdmin = req.user && (req.user.isAdmin || req.user.role === "admin");
    const sanitized = products.map((p) => {
      const obj = p.toObject();
      if (!isAdmin) delete obj.stock;
      return obj;
    });

    res.json({
      products: sanitized,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug",
    );
    if (product) {
      const isAdmin =
        req.user && (req.user.isAdmin || req.user.role === "admin");
      const obj = product.toObject();
      if (!isAdmin) delete obj.stock;
      res.json(obj);
    } else {
      res.status(404).json({ message: "Ürün bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  console.log("CREATE PRODUCT ÇALIŞTI");
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);

  try {
    const { name, description, price, category, brand, stock } = req.body;

    // Birden fazla dosya yüklendiyse hepsinin yolunu al
    const images =
      req.files && req.files.length > 0
        ? req.files.map((f) => f.path)
        : req.body.images
          ? [].concat(req.body.images)
          : req.body.image
            ? [req.body.image]
            : [];

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      image: images[0] || "", // ilk görsel geriye dönük uyumluluk için
    });

    console.log("ÜRÜN OLUŞTURULDU:", product);

    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT HATASI:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    const hasNewFiles = req.files && req.files.length > 0;
    const newImageUrls = hasNewFiles ? req.files.map((f) => f.path) : [];

    // Admin panelinden "korunacak" eski görsellerin listesi gelir.
    // Hiç gönderilmediyse (eski istemci/form), mevcut görselleri olduğu gibi koru.
    const keptExistingUrls = req.body.existingImages
      ? [].concat(req.body.existingImages)
      : product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

    const finalImages = [...keptExistingUrls, ...newImageUrls];

    // Artık listede olmayan eski görselleri Cloudinary'den temizle
    const oldImages =
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];
    const removedImages = oldImages.filter((img) => !finalImages.includes(img));

    for (const img of removedImages) {
      try {
        const publicId = "products/" + img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error("Cloudinary silme hatası:", e.message);
      }
    }

    const {
      images: _ignored,
      image: _ignored2,
      existingImages: _ignored3,
      ...rest
    } = req.body;

    Object.assign(product, {
      ...rest,
      images: finalImages,
      image: finalImages[0] || "",
    });

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: "Ürün silindi" });
    } else {
      res.status(404).json({ message: "Ürün bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString(),
      );
      if (alreadyReviewed) {
        return res
          .status(400)
          .json({ message: "Bu ürüne zaten yorum yaptınız" });
      }
      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, r) => r.rating + a, 0) /
        product.reviews.length;
      await product.save();
      res.status(201).json({ message: "Yorum eklendi" });
    } else {
      res.status(404).json({ message: "Ürün bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
