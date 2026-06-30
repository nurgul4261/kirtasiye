import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      toast.success("Mesajınız gönderildi!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Mesaj gönderilemedi");
    } finally {
      setLoading(false); // ✅ DÜZELTİLDİ: loading(false) yerine setLoading(false) yapıldı
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <div className="container">
          <h1>İletişim</h1>
          <p>Sorularınız için bize ulaşın, en kısa sürede dönüş yapalım.</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Sol — Bilgiler */}
        <div className="contact-info">
          <div className="info-card card">
            <h3>Bize Ulaşın</h3>

            <div className="info-item">
              <span className="info-icon">📞</span>
              <div>
                <strong>Telefon</strong>
                <p>+90 (332) 000 00 00</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <p>kovankirtasiye@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Sosyal Medya */}
          <div className="social-card card">
            <h3>Sosyal Medya</h3>
            <div className="social-links">
              <a
                href="https://instagram.com/kovankirtasiye"
                target="_blank"
                rel="noreferrer"
                className="social-link instagram"
              >
                <svg
                  className="social-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
              <a
                href="https://facebook.com/kovankirtasiye"
                target="_blank"
                rel="noreferrer"
                className="social-link facebook"
              >
                <svg
                  className="social-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
              <a
                href="https://wa.me/905320000000"
                target="_blank"
                rel="noreferrer"
                className="social-link whatsapp"
              >
                <svg
                  className="social-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-3.52c1.642.975 3.251 1.5 5.366 1.501 5.392 0 9.775-4.378 9.777-9.77.002-2.611-1.015-5.066-2.866-6.92C17.072 3.437 14.61 2.42 12.01 2.419c-5.396 0-9.78 4.382-9.782 9.777-.001 2.155.562 3.715 1.584 5.353l-.991 3.616 3.726-.975zm11.367-7.35c-.327-.164-1.933-.955-2.23-1.064-.297-.11-.513-.164-.73.164-.216.327-.837 1.064-1.025 1.282-.19.217-.378.245-.705.082-.327-.164-1.38-.508-2.63-1.623-.972-.867-1.628-1.939-1.819-2.265-.19-.327-.02-.504.144-.666.148-.146.327-.382.49-.573.164-.19.218-.327.327-.545.11-.218.055-.409-.027-.573-.082-.164-.73-1.758-.999-2.408-.262-.63-.53-.545-.73-.555-.187-.01-.401-.01-.615-.01-.215 0-.565.081-.861.409-.296.327-1.13 1.104-1.13 2.695 0 1.591 1.156 3.127 1.318 3.345.162.218 2.276 3.475 5.513 4.877.77.333 1.37.533 1.839.682.774.246 1.479.212 2.036.129.62-.093 1.933-.791 2.204-1.554.271-.764.271-1.417.19-1.554-.083-.137-.297-.218-.624-.382z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Sağ — Form */}
        <div className="contact-form-wrap">
          {sent ? (
            <div className="card success-card">
              <div className="success-icon">✅</div>
              <h2>Mesajınız Alındı!</h2>
              <p>
                Teşekkürler! En kısa sürede size dönüş yapacağız. Email
                adresinize de bir onay gönderdik.
              </p>
              <button className="btn-primary" onClick={() => setSent(false)}>
                Yeni Mesaj Gönder
              </button>
            </div>
          ) : (
            <div className="card contact-form-card">
              <h3>Mesaj Gönder</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ad Soyad *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Konu</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Mesajınızın konusu"
                  />
                </div>
                <div className="form-group">
                  <label>Mesaj *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Mesajınızı buraya yazın..."
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary submit-btn"
                  disabled={loading}
                >
                  {loading ? "Gönderiliyor..." : "✉️ Mesaj Gönder"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
