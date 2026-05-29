import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import { toast } from 'react-toastify';

const statusOptions = [
  { value: 'beklemede', label: '⏳ Beklemede' },
  { value: 'onaylandi', label: '✅ Onaylandı' },
  { value: 'kargoda', label: '🚚 Kargoda' },
  { value: 'teslim_edildi', label: '📦 Teslim Edildi' },
  { value: 'iptal_edildi', label: '❌ İptal Edildi' },
];

const badgeClass = {
  beklemede: 'badge-warning',
  onaylandi: 'badge-primary',
  kargoda: 'badge-primary',
  teslim_edildi: 'badge-success',
  iptal_edildi: 'badge-danger',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Durum güncellendi');
      fetchOrders();
      if (selected?._id === orderId) setSelected({ ...selected, status });
    } catch {
      toast.error('Güncelleme hatası');
    }
  };

  return (
    <AdminLayout title="Sipariş Yönetimi">
      {loading ? <div className="loading">Yükleniyor...</div> : (
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
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{order.user?.email}</div>
                </td>
                <td>{order.totalPrice.toFixed(2)} ₺</td>
                <td>
                  <span className={`badge ${badgeClass[order.status]}`}>
                    {statusOptions.find(s => s.value === order.status)?.label}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{ padding: '5px 8px', fontSize: 13, borderRadius: 6, border: '1px solid var(--border)' }}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}
