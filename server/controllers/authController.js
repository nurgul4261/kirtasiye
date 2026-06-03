const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const User = require("../models/User");

const resend = new Resend(process.env.RESEND_API_KEY);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı" });
    }
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Email veya şifre hatalı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Profil bilgileri
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Profil güncelle
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updated = await user.save();
      res.json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        isAdmin: updated.isAdmin,
        token: generateToken(updated._id),
      });
    } else {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Şifremi unuttum
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Bu email ile kayıtlı kullanıcı bulunamadı" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await resend.emails.send({
      from: "Kovan Kırtasiye <bilgi@kovankirtasiye.com.tr>",
      to: user.email,
      subject: "Şifre Sıfırlama – Kovan Kırtasiye",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #d4500a;">🍯 Kovan Kırtasiye</h2>
          <p style="margin: 20px 0;">Merhaba <strong>${user.name}</strong>,</p>
          <p>Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #d4500a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">
              Şifremi Sıfırla
            </a>
          </div>
          <p style="color: #999; font-size: 13px;">Bu link 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız bu emaili görmezden gelebilirsiniz.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">Kovan Kırtasiye • kovankirtasiye@gmail.com</p>
        </div>
      `,
    });

    res.json({ message: "Şifre sıfırlama linki emailinize gönderildi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Email gönderilemedi" });
  }
};

// @desc    Şifre sıfırla
// @route   POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Link geçersiz veya süresi dolmuş" });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Şifreniz başarıyla güncellendi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
