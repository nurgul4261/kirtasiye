import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Sıfırlama linki gönderildi!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <h2>Şifremi Unuttum</h2>
        {sent ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📧</p>
            <p style={{ marginBottom: 8, fontWeight: 600 }}>
              Email gönderildi!
            </p>
            <p
              style={{
                color: "var(--text-light)",
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik.
              Spam klasörünü de kontrol edin.
            </p>
            <Link
              to="/login"
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Giriş sayfasına dön →
            </Link>
          </div>
        ) : (
          <>
            <p
              style={{
                color: "var(--text-light)",
                fontSize: 14,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              Email adresini girin, sıfırlama linki gönderelim.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ornek@email.com"
                />
              </div>
              <button
                type="submit"
                className="btn-primary login-btn"
                disabled={loading}
              >
                {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
              </button>
            </form>
            <p className="toggle-text">
              <Link
                to="/login"
                style={{
                  color: "var(--primary)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                ← Giriş sayfasına dön
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
