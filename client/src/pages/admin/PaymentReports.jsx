import { useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { toast } from "react-toastify";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function PaymentReports() {
  const [tab, setTab] = useState("transactions"); // 'transactions' | 'statement'

  // İşlem Dökümü state'leri (max 3 gün aralık, saat dahil)
  const [txStart, setTxStart] = useState(`${todayStr()} 00:00:00`);
  const [txEnd, setTxEnd] = useState(`${todayStr()} 23:59:59`);
  const [txData, setTxData] = useState(null);
  const [txLoading, setTxLoading] = useState(false);

  // Ödeme Özeti state'leri (sadece tarih)
  const [stStart, setStStart] = useState(todayStr());
  const [stEnd, setStEnd] = useState(todayStr());
  const [stData, setStData] = useState(null);
  const [stLoading, setStLoading] = useState(false);

  const fetchTransactions = async () => {
    setTxLoading(true);
    setTxData(null);
    try {
      const { data } = await api.get("/payment/report/transactions", {
        params: { start_date: txStart, end_date: txEnd },
      });
      setTxData(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Rapor alınamadı");
    } finally {
      setTxLoading(false);
    }
  };

  const fetchStatement = async () => {
    setStLoading(true);
    setStData(null);
    try {
      const { data } = await api.get("/payment/report/statement", {
        params: { start_date: stStart, end_date: stEnd },
      });
      setStData(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Rapor alınamadı");
    } finally {
      setStLoading(false);
    }
  };

  return (
    <AdminLayout title="Ödeme Raporları">
      {/* Sekmeler */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab("transactions")}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: tab === "transactions" ? "var(--primary)" : "#f5f5f5",
            color: tab === "transactions" ? "#fff" : "#333",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📄 İşlem Dökümü
        </button>
        <button
          onClick={() => setTab("statement")}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: tab === "statement" ? "var(--primary)" : "#f5f5f5",
            color: tab === "statement" ? "#fff" : "#333",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          💰 Ödeme Özeti
        </button>
      </div>

      {/* İşlem Dökümü Sekmesi */}
      {tab === "transactions" && (
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
            Not: PayTR bu serviste en fazla 3 günlük aralık sorgulamanıza izin
            verir.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label
                style={{ fontSize: 13, display: "block", marginBottom: 4 }}
              >
                Başlangıç (YYYY-MM-DD HH:mm:ss)
              </label>
              <input
                type="text"
                value={txStart}
                onChange={(e) => setTxStart(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <div>
              <label
                style={{ fontSize: 13, display: "block", marginBottom: 4 }}
              >
                Bitiş (YYYY-MM-DD HH:mm:ss)
              </label>
              <input
                type="text"
                value={txEnd}
                onChange={(e) => setTxEnd(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <button
              onClick={fetchTransactions}
              disabled={txLoading}
              className="btn-primary"
              style={{ padding: "9px 20px" }}
            >
              {txLoading ? "Yükleniyor..." : "Sorgula"}
            </button>
          </div>

          {txData && (
            <pre
              style={{
                marginTop: 20,
                background: "#f8f8f8",
                padding: 16,
                borderRadius: 8,
                fontSize: 12,
                overflowX: "auto",
                maxHeight: 400,
              }}
            >
              {JSON.stringify(txData, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Ödeme Özeti Sekmesi */}
      {tab === "statement" && (
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
            Hesabınıza yatırılan/yatırılacak tutarların özetini gösterir.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label
                style={{ fontSize: 13, display: "block", marginBottom: 4 }}
              >
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={stStart}
                onChange={(e) => setStStart(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <div>
              <label
                style={{ fontSize: 13, display: "block", marginBottom: 4 }}
              >
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={stEnd}
                onChange={(e) => setStEnd(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <button
              onClick={fetchStatement}
              disabled={stLoading}
              className="btn-primary"
              style={{ padding: "9px 20px" }}
            >
              {stLoading ? "Yükleniyor..." : "Sorgula"}
            </button>
          </div>

          {stData && (
            <pre
              style={{
                marginTop: 20,
                background: "#f8f8f8",
                padding: 16,
                borderRadius: 8,
                fontSize: 12,
                overflowX: "auto",
                maxHeight: 400,
              }}
            >
              {JSON.stringify(stData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
