const Category = require("../models/Category");

// Türkçe slug üretici
const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// @GET /api/categories
// Tüm kategorileri ağaç yapısında döndürür
const getCategories = async (req, res) => {
  try {
    const all = await Category.find({}).sort({ order: 1, name: 1 });

    // Ana kategoriler (parent: null)
    const parents = all.filter((c) => !c.parent);

    // Her ana kategoriye alt kategorilerini ekle
    const tree = parents.map((parent) => ({
      ...parent.toObject(),
      children: all.filter(
        (c) => c.parent?.toString() === parent._id.toString(),
      ),
    }));

    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/categories/flat
// Düz liste (ürün filtreleme için)
const getCategoriesFlat = async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate("parent", "name slug")
      .sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, image, parent, order } = req.body;
    const slug = toSlug(name);
    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parent: parent || null,
      order: order || 0,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Kategori bulunamadı" });

    category.name = req.body.name || category.name;
    category.description =
      req.body.description !== undefined
        ? req.body.description
        : category.description;
    category.image =
      req.body.image !== undefined ? req.body.image : category.image;
    category.order =
      req.body.order !== undefined ? req.body.order : category.order;
    category.parent =
      req.body.parent !== undefined ? req.body.parent || null : category.parent;

    if (req.body.name) category.slug = toSlug(req.body.name);

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    // Alt kategorileri de sil
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Kategori bulunamadı" });

    await Category.deleteMany({ parent: req.params.id });
    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Kategori ve alt kategorileri silindi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoriesFlat,
  createCategory,
  updateCategory,
  deleteCategory,
};
