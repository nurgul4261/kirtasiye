# Kırtasiye E-Ticaret

React + Node.js + MongoDB ile geliştirilmiş tam e-ticaret uygulaması.

## Özellikler

- 🛍️ Ürün listeleme, arama ve filtreleme
- 🛒 Sepet yönetimi (localStorage)
- 👤 Kullanıcı kayıt ve giriş (JWT)
- 📦 Sipariş oluşturma ve takip
- ⚙️ Admin paneli (ürün, sipariş, kullanıcı, kategori yönetimi)

## Kurulum

### Gereksinimler

- Node.js v18+
- MongoDB (local veya Atlas)

### Backend

```bash
cd server
npm install
# .env dosyasını düzenleyin (MONGO_URI, JWT_SECRET)
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## .env Ayarları (server/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/kirtasiye
JWT_SECRET=gizli_anahtar_buraya
NODE_ENV=development
```

## Admin Hesabı Oluşturma

MongoDB'de bir kullanıcı kaydedip `isAdmin: true` yapın:

```js
// MongoDB Shell
db.users.updateOne({ email: "admin@test.com" }, { $set: { isAdmin: true } });
```

## API Endpoints

| Method | URL                  | Açıklama           |
| ------ | -------------------- | ------------------ |
| POST   | /api/auth/register   | Kayıt              |
| POST   | /api/auth/login      | Giriş              |
| GET    | /api/products        | Ürün listesi       |
| GET    | /api/products/:id    | Ürün detayı        |
| POST   | /api/orders          | Sipariş oluştur    |
| GET    | /api/orders/myorders | Kendi siparişlerim |
| GET    | /api/categories      | Kategoriler        |
