const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoriesFlat,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getCategories);
router.get("/flat", getCategoriesFlat);
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
