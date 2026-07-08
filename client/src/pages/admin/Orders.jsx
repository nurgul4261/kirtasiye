import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { toast } from "react-toastify";

const statusOptions = [
  { value: "beklemede", label: "⏳ Beklemede" },
  { value: "onaylandi", label: "✅ Onaylandı" },
  { value: "kargoda", label: "🚚 Kargoda" },
  { value: "teslim_edildi", label: "📦 Teslim Edildi" },
  { value: "iptal_edildi", label: "❌ İptal Edildi" },
];

const badgeClass = {
  beklemede: "badge-warning",
  onaylandi: "badge-primary",
  kargoda: "badge-primary",
  teslim_edildi: "badge-success",
  iptal_edildi: "badge-danger",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // ── İade işlemi state'leri ──
  const [refundAmount, setRefundAmount] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success("Durum güncellendi");
      fetchOrders();
      if (selected?._id === orderId)
        setSelected((prev) => ({ ...prev, status }));
    } catch {
      toast.error("Güncelleme hatası");
    }
  };

  // Siparişin PayTR'deki güncel durumunu sorgular (callback gelmediyse yedek kontrol)
  const handleCheckStatus = async (orderId) => {
    setCheckingStatus(true);
    try {
      const { data } = await api.get(`/payment/status/${orderId}`);
      if (data.status === "success") {
        toast.success(
          `PayTR'de ödendi görünüyor: ${data.payment_amount} ${data.currency}`,
        );
        fetchOrders();
      } else {
        toast.info(data.err_msg || "PayTR'de ödeme kaydı bulunamadı");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Sorgu başarısız");
    } finally {
      setCheckingStatus(false);
    }
  };

  // Kısmi veya tam iade işlemini başlatır
  const handleRefund = async (order) => {
    const amount = refundAmount
      ? Number(refundAmount)
      : order.totalPrice - (order.refundAmount || 0);

    if (!amount || amount <= 0) {
      return toast.error("Geçerli bir iade tutarı girin");
    }
    if (!window.confirm(`${amount.toFixed(2)} ₺ iade edilecek. Emin misiniz?`))
      return;

    setRefunding(true);
    try {
      const { data } = await api.post("/payment/refund", {
        orderId: order._id,
        amount,
      });
      toast.success("İade işlemi başarılı");
      setSelected(data.order);
      setRefundAmount("");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "İade işlemi başarısız");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <AdminLayout title="Sipariş Yönetimi">
      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div>{order.user?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-light)" }}>
                      {order.user?.email}
                    </div>
                  </td>
                  <td>{order.totalPrice.toFixed(2)} ₺</td>
                  <td>
                    <span className={`badge ${badgeClass[order.status]}`}>
                      {
                        statusOptions.find((s) => s.value === order.status)
                          ?.label
                      }
                    </span>
                    {order.isPaid && (
                      <div
                        style={{ fontSize: 11, color: "#16a34a", marginTop: 4 }}
                      >
                        💳 Ödendi
                      </div>
                    )}
                    {order.isRefunded && (
                      <div
                        style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}
                      >
                        ↩️ İade Edildi
                      </div>
                    )}
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      style={{
                        padding: "5px 8px",
                        fontSize: 13,
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                      }}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setSelected(order)}
                      style={{
                        padding: "5px 12px",
                        fontSize: 13,
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        cursor: "pointer",
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        fontWeight: 600,
                      }}
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Detay Modal */}
          {selected && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                zIndex: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setSelected(null)}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 32,
                  maxWidth: 560,
                  width: "90%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    Sipariş #{selected._id.slice(-6).toUpperCase()}
                  </h3>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Müşteri */}
                <div style={{ marginBottom: 16 }}>
                  <strong>Müşteri</strong>
                  <p style={{ margin: "4px 0" }}>
                    {selected.user?.name} — {selected.user?.email}
                  </p>
                </div>

                {/* Teslimat Adresi */}
                <div style={{ marginBottom: 16 }}>
                  <strong>Teslimat Adresi</strong>
                  <p style={{ margin: "4px 0", lineHeight: 1.6 }}>
                    {selected.shippingAddress?.name}
                    <br />
                    {selected.shippingAddress?.phone}
                    <br />
                    {selected.shippingAddress?.street}
                    <br />
                    {selected.shippingAddress?.district} /{" "}
                    {selected.shippingAddress?.city}
                    {selected.shippingAddress?.zipCode &&
                      ` ${selected.shippingAddress.zipCode}`}
                  </p>
                </div>

                {/* Ürünler */}
                <div style={{ marginBottom: 16 }}>
                  <strong>Ürünler</strong>
                  {selected.orderItems?.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
                    </div>
                  ))}
                </div>

                {/* Fiyat */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                    }}
                  >
                    <span>Kargo</span>
                    <span>
                      {selected.shippingPrice === 0
                        ? "Ücretsiz"
                        : `${selected.shippingPrice} ₺`}
                    </span>
                  </div>
                  {selected.discountAmount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 0",
                        color: "#16a34a",
                      }}
                    >
                      <span>İndirim</span>
                      <span>-{selected.discountAmount?.toFixed(2)} ₺</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      fontWeight: 700,
                    }}
                  >
                    <span>Toplam</span>
                    <span>{selected.totalPrice?.toFixed(2)} ₺</span>
                  </div>
                  {selected.refundAmount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 0",
                        color: "#dc2626",
                      }}
                    >
                      <span>İade Edilen</span>
                      <span>-{selected.refundAmount.toFixed(2)} ₺</span>
                    </div>
                  )}
                </div>

                {/* Not */}
                {selected.notes && (
                  <div style={{ marginBottom: 16 }}>
                    <strong>Sipariş Notu</strong>
                    <p style={{ margin: "4px 0", color: "#666" }}>
                      {selected.notes}
                    </p>
                  </div>
                )}

                {/* Durum güncelle */}
                <div style={{ marginBottom: 16 }}>
                  <strong>Durum Güncelle</strong>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      handleStatusChange(selected._id, e.target.value)
                    }
                    style={{
                      display: "block",
                      marginTop: 8,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      width: "100%",
                    }}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ── Ödeme İşlemleri (PayTR) ── */}
                {selected.isPaid && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #eee",
                    }}
                  >
                    <strong>Ödeme İşlemleri (PayTR)</strong>

                    <button
                      onClick={() => handleCheckStatus(selected._id)}
                      disabled={checkingStatus}
                      style={{
                        display: "block",
                        width: "100%",
                        marginTop: 10,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "#f5f5f5",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {checkingStatus
                        ? "Sorgulanıyor..."
                        : "🔍 PayTR'de Durumu Sorgula"}
                    </button>

                    {!selected.isRefunded && (
                      <div style={{ marginTop: 12 }}>
                        <label style={{ fontSize: 13, color: "#666" }}>
                          İade Tutarı (boş bırakılırsa tam iade yapılır)
                        </label>
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                          <input
                            type="number"
                            step="0.01"
                            placeholder={`Maks. ${(selected.totalPrice - (selected.refundAmount || 0)).toFixed(2)} ₺`}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1px solid #ddd",
                            }}
                          />
                          <button
                            onClick={() => handleRefund(selected)}
                            disabled={refunding}
                            style={{
                              padding: "8px 16px",
                              borderRadius: 8,
                              border: "none",
                              background: "#dc2626",
                              color: "#fff",
                              fontWeight: 600,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {refunding ? "İşleniyor..." : "↩️ İade Et"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
