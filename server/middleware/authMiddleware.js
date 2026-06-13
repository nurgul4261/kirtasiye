const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Token geçersiz" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Token bulunamadı, yetki yok" });
  }
};

const admin = (req, res, next) => {
  console.log("req.user =", req.user);

  if (req.user && (req.user.isAdmin || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      message: "Admin yetkisi gerekli",
      user: req.user,
    });
  }
};
module.exports = { protect, admin };
