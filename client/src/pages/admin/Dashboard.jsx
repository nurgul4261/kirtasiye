import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import "./AdminLayout.css";

// Gelire sadece ödemesi alınmış ve iptal edilmemiş siparişler girer.
// Kısmi iade varsa iade tutarı düşülür.
const countsAsRevenue = (o) => o.isPaid && o.status !== "iptal_edildi";
const netAmount = (o) => o.totalPrice - (o.refundAmount || 0);

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    paidOrders: 0,
    users: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          api.get("/products?pageSize=1"),
          api.get("/orders"),
          api.get("/users"),
        ]);
        const orders = ordersRes.data;
        const revenueOrders = orders.filter(countsAsRevenue);
        const revenue = revenueOrders.reduce((sum, o) => sum + netAmount(o), 0);
        setStats({
          products: productsRes.data.total,
          orders: orders.length,
          paidOrders: revenueOrders.length,
          users: usersRes.data.length,
          revenue,
        });
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusLabel = {
    beklemede: "⏳ Beklemede",
    onaylandi: "✅ Onaylandı",
    kargoda: "🚚 Kargoda",
    teslim_edildi: "📦 Teslim Edildi",
    iptal_edildi: "❌ İptal",
  };

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Toplam Ürün</div>
              <div className="stat-value">{stats.products}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Toplam Sipariş</div>
              <div className="stat-value">{stats.orders}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Toplam Kullanıcı</div>
              <div className="stat-value">{stats.users}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Toplam Gelir</div>
              <div className="stat-value">{stats.revenue.toFixed(0)} ₺</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                {stats.paidOrders} ödenmiş sipariş
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: 14, fontWeight: 700 }}>Son Siparişler</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sipariş ID</th>
                <th>Müşteri</th>
                <th>Toplam</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>{order.user?.name}</td>
                  <td>{order.totalPrice.toFixed(2)} ₺</td>
                  <td>{statusLabel[order.status]}</td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </AdminLayout>
  );
}
