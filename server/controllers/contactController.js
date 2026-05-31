const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc    İletişim formu gönder
// @route   POST /api/contact
const sendContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Ad, email ve mesaj zorunludur" });
    }

    // Mağazaya bildirim emaili
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `[Kovan Kırtasiye] Yeni Mesaj: ${subject || "İletişim Formu"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #d4500a; margin-bottom: 24px;">🍯 Yeni İletişim Mesajı</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Ad Soyad:</strong></td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;"><strong>Konu:</strong></td>
              <td style="padding: 8px 0;">${subject || "-"}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #faf8f5; border-radius: 6px; border-left: 4px solid #d4500a;">
            <strong style="color: #666;">Mesaj:</strong>
            <p style="margin-top: 8px; line-height: 1.7;">${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">Bu email Kovan Kırtasiye iletişim formundan gönderilmiştir.</p>
        </div>
      `,
    });

    // Kullanıcıya teşekkür emaili
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mesajınız alındı – Kovan Kırtasiye",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #d4500a;">🍯 Kovan Kırtasiye</h2>
          <p style="margin: 20px 0; line-height: 1.7;">Merhaba <strong>${name}</strong>,</p>
          <p style="line-height: 1.7;">Mesajınız için teşekkür ederiz! En kısa sürede size dönüş yapacağız.</p>
          <div style="margin: 24px 0; padding: 16px; background: #faf8f5; border-radius: 6px; border-left: 4px solid #d4500a;">
            <strong>Mesajınız:</strong>
            <p style="margin-top: 8px; color: #666; line-height: 1.7;">${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="line-height: 1.7;">Saygılarımızla,<br><strong>Kovan Kırtasiye Ekibi</strong></p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">kovankirtasiye@gmail.com</p>
        </div>
      `,
    });

    res.json({ message: "Mesajınız başarıyla gönderildi" });
  } catch (error) {
    console.error("Email hatası:", error);
    res
      .status(500)
      .json({ message: "Email gönderilemedi, lütfen tekrar deneyin" });
  }
};

module.exports = { sendContact };
