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

// Token varsa decode eder, yoksa geçer — kimlik doğrulama zorunlu değil
const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch {
      // Geçersiz token olsa bile devam et, req.user boş kalır
    }
  }
  next();
};

const admin = (req, res, next) => {
  console.log("ADMIN MIDDLEWARE ÇALIŞTI");
  console.log("req.user:", req.user);

  if (req.user && (req.user.isAdmin || req.user.role === "admin")) {
    console.log("ADMIN ONAYLANDI");
    next();
  } else {
    console.log("ADMIN REDDEDİLDİ");
    res.status(403).json({ message: "Admin yetkisi gerekli" });
  }
};

module.exports = { protect, admin, optionalProtect };
