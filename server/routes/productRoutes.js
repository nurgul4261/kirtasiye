const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require("../controllers/productController");
const {
  protect,
  admin,
  optionalProtect,
} = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// optionalProtect: token varsa admin kontrolü yapılır, yoksa stock gizlenir
router.get("/", optionalProtect, getProducts);
router.get("/:id", optionalProtect, getProductById);

router.post(
  "/",
  protect,
  admin,
  (req, res, next) => {
    upload.array("images", 5)(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      next();
    });
  },
  createProduct,
);
router.put(
  "/:id",
  protect,
  admin,
  (req, res, next) => {
    upload.array("images", 5)(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      next();
    });
  },
  updateProduct,
);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/reviews", protect, createProductReview);

module.exports = router;
