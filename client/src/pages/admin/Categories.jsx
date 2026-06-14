import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { toast } from "react-toastify";

const emptyForm = {
  name: "",
  description: "",
  image: "",
  parent: "",
  order: 0,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [flatCats, setFlatCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = async () => {
    try {
      const [treeRes, flatRes] = await Promise.all([
        api.get("/categories"), // ağaç yapısı
        api.get("/categories/flat"), // düz liste (dropdown için)
      ]);
      setCategories(treeRes.data);
      setFlatCats(flatRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditCat(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditCat(c);
    setForm({
      name: c.name,
      description: c.description || "",
      image: c.image || "",
      parent: c.parent?._id || c.parent || "",
      order: c.order || 0,
    });
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, parent: form.parent || null };
      if (editCat) {
        await api.put(`/categories/${editCat._id}`, payload);
        toast.success("Kategori güncellendi");
      } else {
        await api.post("/categories", payload);
        toast.success("Kategori eklendi");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Hata");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Bu kategoriyi ve alt kategorilerini silmek istiyor musunuz?",
      )
    )
      return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Silindi");
      fetchCategories();
    } catch {
      toast.error("Silme hatası");
    }
  };

  return (
    <AdminLayout title="Kategori Yönetimi">
      <div className="admin-toolbar">
        <span>{flatCats.length} kategori</span>
        <button className="btn-primary" onClick={openCreate}>
          + Yeni Kategori
        </button>
      </div>

      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kategori Adı</th>
              <th>Üst Kategori</th>
              <th>Slug</th>
              <th>Açıklama</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <>
                {/* Ana kategori */}
                <tr key={cat._id} style={{ background: "#f8f8f8" }}>
                  <td style={{ fontWeight: 700 }}>📁 {cat.name}</td>
                  <td style={{ color: "#aaa", fontSize: 13 }}>—</td>
                  <td style={{ color: "var(--text-light)", fontSize: 13 }}>
                    {cat.slug}
                  </td>
                  <td>{cat.description || "-"}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="btn-primary"
                        onClick={() => openEdit(cat)}
                      >
                        Düzenle
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(cat._id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Alt kategoriler */}
                {cat.children?.map((sub) => (
                  <tr key={sub._id}>
                    <td style={{ paddingLeft: 28, color: "#555" }}>
                      ↳ {sub.name}
                    </td>
                    <td style={{ fontSize: 13, color: "#888" }}>{cat.name}</td>
                    <td style={{ color: "var(--text-light)", fontSize: 13 }}>
                      {sub.slug}
                    </td>
                    <td>{sub.description || "-"}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="btn-primary"
                          onClick={() => openEdit(sub)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(sub._id)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editCat ? "Kategori Düzenle" : "Yeni Kategori"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Kategori Adı</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Üst Kategori{" "}
                  <span style={{ color: "#aaa", fontWeight: 400 }}>
                    (boş = ana kategori)
                  </span>
                </label>
                <select
                  name="parent"
                  value={form.parent}
                  onChange={handleChange}
                >
                  <option value="">— Ana Kategori —</option>
                  {flatCats
                    .filter((c) => !c.parent && c._id !== editCat?._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sıralama</label>
                <input
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label>Görsel URL</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  {editCat ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
