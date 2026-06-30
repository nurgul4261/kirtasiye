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
const { upload } = require("../config/cloudinary");

router.get("/", getCategories);
router.get("/flat", getCategoriesFlat);

router.post(
  "/",
  protect,
  admin,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      next();
    });
  },
  createCategory,
);

router.put(
  "/:id",
  protect,
  admin,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      next();
    });
  },
  updateCategory,
);

router.delete("/:id", protect, admin, deleteCategory);

module.exports = router;
