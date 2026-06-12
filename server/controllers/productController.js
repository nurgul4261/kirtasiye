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

    res.json({
      products,
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
      res.json(product);
    } else {
      res.status(404).json({ message: "Ürün bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock } = req.body;
    const image = req.file ? req.file.path : req.body.image;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      image,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    if (req.file && product.image) {
      const publicId =
        "products/" + product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const image = req.file ? req.file.path : product.image;
    Object.assign(product, { ...req.body, image });
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
