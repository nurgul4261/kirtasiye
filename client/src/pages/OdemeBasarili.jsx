import { Link } from "react-router-dom";

export default function OdemeBasarili() {
  return (
    <div
      className="container"
      style={{ textAlign: "center", padding: "60px 20px" }}
    >
      <h1 style={{ color: "#16a34a" }}>✅ Ödemeniz Alındı</h1>
      <p>Siparişiniz onaylandı, en kısa sürede hazırlanmaya başlanacak.</p>
      <Link
        to="/"
        className="btn-primary"
        style={{ display: "inline-block", marginTop: "20px" }}
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
