import { Link } from "react-router-dom";

export default function OdemeBasarisiz() {
  return (
    <div
      className="container"
      style={{ textAlign: "center", padding: "60px 20px" }}
    >
      <h1 style={{ color: "#dc2626" }}>❌ Ödeme Başarısız</h1>
      <p>
        Ödemeniz gerçekleştirilemedi. Siparişiniz iptal edildi, lütfen tekrar
        deneyin.
      </p>
      <Link
        to="/cart"
        className="btn-primary"
        style={{ display: "inline-block", marginTop: "20px" }}
      >
        Sepete Dön
      </Link>
    </div>
  );
}
