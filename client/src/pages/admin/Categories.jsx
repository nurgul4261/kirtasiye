import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";

const emptyForm = {
  name: "",
  description: "",
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const [treeRes, flatRes] = await Promise.all([
        api.get("/categories"),
        api.get("/categories/flat"),
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
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditCat(c);
    setForm({
      name: c.name,
      description: c.description || "",
      parent: c.parent?._id || c.parent || "",
      order: c.order || 0,
    });
    setImageFile(null);
    setImagePreview(c.image || "");
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("order", form.order);
      formData.append("parent", form.parent || "");

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (!imagePreview) {
        // Görsel kaldırıldıysa boş gönder
        formData.append("image", "");
      }
      // imageFile yok ama imagePreview varsa (mevcut görsel korunuyor),
      // "image" alanını hiç göndermiyoruz; backend mevcut değeri korur.

      if (editCat)
        await api.put(`/categories/${editCat._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      else
        await api.post("/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      toast.success(editCat ? "Kategori güncellendi" : "Kategori eklendi");
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Hata");
    } finally {
      setSaving(false);
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

  // Tablo satırlarını düz diziye çevir (fragment key sorunundan kaçınmak için)
  const buildRows = () => {
    const rows = [];
    categories.forEach((cat) => {
      rows.push(
        <tr key={cat._id} style={{ background: "#f8f8f8" }}>
          <td>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {cat.image ? (
                <img
                  src={cat.image}
                  alt=""
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              ) : (
                <span style={{ fontSize: 18 }}>📁</span>
              )}
              <span style={{ fontWeight: 700 }}>{cat.name}</span>
            </div>
          </td>
          <td style={{ color: "#aaa", fontSize: 13 }}>—</td>
          <td style={{ color: "var(--text-light)", fontSize: 13 }}>
            {cat.slug}
          </td>
          <td>{cat.description || "-"}</td>
          <td>
            <div className="admin-actions">
              <button className="btn-primary" onClick={() => openEdit(cat)}>
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
        </tr>,
      );
      cat.children?.forEach((sub) => {
        rows.push(
          <tr key={sub._id}>
            <td style={{ paddingLeft: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {sub.image ? (
                  <img
                    src={sub.image}
                    alt=""
                    style={{
                      width: 30,
                      height: 30,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 14, color: "#888" }}>↳</span>
                )}
                <span style={{ color: "#555" }}>{sub.name}</span>
              </div>
            </td>
            <td style={{ fontSize: 13, color: "#888" }}>{cat.name}</td>
            <td style={{ color: "var(--text-light)", fontSize: 13 }}>
              {sub.slug}
            </td>
            <td>{sub.description || "-"}</td>
            <td>
              <div className="admin-actions">
                <button className="btn-primary" onClick={() => openEdit(sub)}>
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
          </tr>,
        );
      });
    });
    return rows;
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
          <tbody>{buildRows()}</tbody>
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
                <label>Kategori Görseli</label>
                {compressing && (
                  <p style={{ fontSize: 13, color: "var(--primary)" }}>
                    Görsel optimize ediliyor...
                  </p>
                )}
                {imagePreview && !compressing && (
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <img
                      src={imagePreview}
                      alt="Önizleme"
                      style={{
                        width: "100%",
                        maxHeight: 180,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #eee",
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--danger)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        lineHeight: 1,
                        boxShadow: "none",
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-light)",
                    marginTop: 6,
                  }}
                >
                  Anasayfadaki kategori kartında arka plan olarak kullanılır.
                </p>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving || compressing}
                >
                  {compressing
                    ? "Optimize ediliyor..."
                    : saving
                      ? "Kaydediliyor..."
                      : editCat
                        ? "Güncelle"
                        : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
