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
const { protect, admin } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  protect,
  admin,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.log("MULTER HATASI:", err);
        return res.status(500).json({ message: err.message });
      }
      next();
    });
  },
  createProduct,
);
router.put("/:id", protect, admin, upload.single("image"), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/reviews", protect, createProductReview);

module.exports = router;
