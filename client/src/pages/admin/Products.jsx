import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../services/api';
import { toast } from 'react-toastify';

const emptyForm = { name: '', description: '', price: '', stock: '', brand: '', image: '', category: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?pageSize=100');
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  const openCreate = () => { setEditProduct(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, brand: p.brand || '', image: p.image || '', category: p.category?._id || '' });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success('Ürün güncellendi');
      } else {
        await api.post('/products', payload);
        toast.success('Ürün eklendi');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Ürün silindi');
      fetchProducts();
    } catch (err) {
      toast.error('Silme hatası');
    }
  };

  return (
    <AdminLayout title="Ürün Yönetimi">
      <div className="admin-toolbar">
        <span>{products.length} ürün</span>
        <button className="btn-primary" onClick={openCreate}>+ Yeni Ürün</button>
      </div>

      {loading ? <div className="loading">Yükleniyor...</div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Kategori</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={p.image || '/placeholder.png'} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </td>
                <td>{p.category?.name || '-'}</td>
                <td>{p.price.toFixed(2)} ₺</td>
                <td>
                  <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="btn-primary" onClick={() => openEdit(p)}>Düzenle</button>
                    <button className="btn-danger" onClick={() => handleDelete(p._id)}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Ürün Adı</label><input name="name" value={form.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Açıklama</label><textarea name="description" value={form.description} onChange={handleChange} required rows={3} /></div>
              <div className="form-group"><label>Kategori</label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Seçin</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>Fiyat (₺)</label><input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" /></div>
                <div className="form-group"><label>Stok</label><input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" /></div>
              </div>
              <div className="form-group"><label>Marka</label><input name="brand" value={form.brand} onChange={handleChange} /></div>
              <div className="form-group"><label>Görsel URL</label><input name="image" value={form.image} onChange={handleChange} /></div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>İptal</button>
                <button type="submit" className="btn-primary">{editProduct ? 'Güncelle' : 'Ekle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
