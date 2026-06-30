import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../services/api";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";

const MAX_IMAGES = 5;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  brand: "",
  category: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  // imageItems: [{ file, preview }] — hem yeni seçilenler hem mevcut görseller burada tutulur
  const [imageItems, setImageItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products?pageSize=100");
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Düz liste — alt kategoriler de görünür
    api.get("/categories/flat").then(({ data }) => setCategories(data));
  }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setImageItems([]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      brand: p.brand || "",
      category: p.category?._id || "",
    });
    const existing = p.images?.length ? p.images : p.image ? [p.image] : [];
    setImageItems(existing.map((url) => ({ file: null, preview: url })));
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = MAX_IMAGES - imageItems.length;
    if (remainingSlots <= 0) {
      toast.warn(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz`);
      e.target.value = "";
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.warn(`En fazla ${MAX_IMAGES} görsel ekleyebilirsiniz`);
    }

    setCompressing(true);
    try {
      const compressedItems = await Promise.all(
        filesToProcess.map(async (file) => {
          try {
            const compressed = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1024,
              useWebWorker: true,
            });
            return {
              file: compressed,
              preview: URL.createObjectURL(compressed),
            };
          } catch {
            return { file, preview: URL.createObjectURL(file) };
          }
        }),
      );
      setImageItems((prev) => [...prev, ...compressedItems]);
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };

  const removeImage = (index) => {
    setImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageItems.length === 0) {
      toast.warn("En az 1 görsel eklemelisiniz");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", Number(form.price));
      formData.append("stock", Number(form.stock));
      formData.append("brand", form.brand);
      formData.append("category", form.category);

      // Yeni eklenen dosyalar varsa, hepsini "images" alanı altında gönder
      const newFiles = imageItems.filter((it) => it.file).map((it) => it.file);
      const keptExistingUrls = imageItems
        .filter((it) => !it.file)
        .map((it) => it.preview);

      newFiles.forEach((file) => formData.append("images", file));
      // Silinmemiş, mevcut (URL) görselleri de bildiriyoruz ki
      // kullanıcı bazı görselleri kaldırıp yeni dosya eklemediğinde
      // backend bu kaldırmayı uygulayabilsin
      keptExistingUrls.forEach((url) => formData.append("existingImages", url));

      if (editProduct)
        await api.put(`/products/${editProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      else
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      toast.success(editProduct ? "Ürün güncellendi" : "Ürün eklendi");
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Hata");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Ürün silindi");
      fetchProducts();
    } catch {
      toast.error("Silme hatası");
    }
  };

  // Kategori dropdown'ı için gruplu gösterim
  const renderCategoryOptions = () => {
    const parents = categories.filter((c) => !c.parent);
    const children = categories.filter((c) => c.parent);

    return parents.map((parent) => {
      const subs = children.filter((c) => {
        const parentId = c.parent?._id || c.parent;
        return parentId === parent._id;
      });

      if (subs.length === 0) {
        return (
          <option key={parent._id} value={parent._id}>
            {parent.name}
          </option>
        );
      }

      return (
        <optgroup key={parent._id} label={`📁 ${parent.name}`}>
          <option value={parent._id}>— Tüm {parent.name}</option>
          {subs.map((sub) => (
            <option key={sub._id} value={sub._id}>
              ↳ {sub.name}
            </option>
          ))}
        </optgroup>
      );
    });
  };

  return (
    <AdminLayout title="Ürün Yönetimi">
      <div className="admin-toolbar">
        <span>{products.length} ürün</span>
        <button className="btn-primary" onClick={openCreate}>
          + Yeni Ürün
        </button>
      </div>

      {loading ? (
        <div className="loading">Yükleniyor...</div>
      ) : (
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <img
                      src={p.image || p.images?.[0] || "/placeholder.png"}
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </td>
                <td>{p.category?.name || "-"}</td>
                <td>{p.price.toFixed(2)} ₺</td>
                <td>
                  <span
                    className={`badge ${p.stock > 0 ? "badge-success" : "badge-danger"}`}
                  >
                    {p.stock}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="btn-primary" onClick={() => openEdit(p)}>
                      Düzenle
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(p._id)}
                    >
                      Sil
                    </button>
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
            <h3>{editProduct ? "Ürün Düzenle" : "Yeni Ürün"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ürün Adı</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seçin</option>
                  {renderCategoryOptions()}
                </select>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div className="form-group">
                  <label>Fiyat (₺)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Stok</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Marka</label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Ürün Görselleri ({imageItems.length}/{MAX_IMAGES})
                </label>
                {compressing && (
                  <p style={{ fontSize: 13, color: "var(--primary)" }}>
                    Görseller optimize ediliyor...
                  </p>
                )}

                {imageItems.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    {imageItems.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          width: 84,
                          height: 84,
                        }}
                      >
                        <img
                          src={item.preview}
                          alt={`Görsel ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                            border:
                              index === 0
                                ? "2px solid var(--primary)"
                                : "1px solid #eee",
                          }}
                        />
                        {index === 0 && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 2,
                              left: 2,
                              background: "var(--primary)",
                              color: "#fff",
                              fontSize: 9,
                              padding: "1px 5px",
                              borderRadius: 4,
                            }}
                          >
                            Kapak
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "var(--danger)",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            lineHeight: 1,
                            boxShadow: "none",
                            padding: 0,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {imageItems.length < MAX_IMAGES && (
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                  />
                )}
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-light)",
                    marginTop: 6,
                  }}
                >
                  İlk görsel ürün kartında kapak fotoğrafı olarak kullanılır.
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
                  disabled={uploading || compressing}
                >
                  {compressing
                    ? "Optimize ediliyor..."
                    : uploading
                      ? "Yükleniyor..."
                      : editProduct
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
