// utils/orderMails.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const MAIL_FROM = "Kovan Kırtasiye <bilgi@kovankirtasiye.com.tr>";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const orderNoOf = (order) => order._id.toString().slice(-6).toUpperCase();

const itemsTableHtml = (items) => `
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead>
      <tr style="background:#f5f5f5">
        <th style="padding:8px;text-align:left">Ürün</th>
        <th style="padding:8px;text-align:center">Adet</th>
        <th style="padding:8px;text-align:right">Tutar</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${escapeHtml(item.quantity)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${(item.price * item.quantity).toFixed(2)} ₺</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>`;

// Müşteriye: ödeme alındı + sipariş alındı
async function sendOrderReceivedToCustomer(order) {
  if (!order.user?.email) return;
  const orderNo = orderNoOf(order);

  await resend.emails.send({
    from: MAIL_FROM,
    to: order.user.email,
    subject: `📝 Siparişiniz Alındı — Sipariş #${orderNo}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
        <h2 style="color:#1a2744">Siparişiniz Alındı!</h2>
        <p><strong>Sipariş No:</strong> #${orderNo}</p>
        <p style="color:#444;line-height:1.6">Ödemeniz başarıyla alındı ve siparişiniz onaylandı. Kargoya verildiğinde sizi tekrar bilgilendireceğiz.</p>
        ${itemsTableHtml(order.orderItems)}
        ${order.discountAmount > 0 ? `<p style="color:#16a34a"><strong>İndirim:</strong> -${order.discountAmount.toFixed(2)} ₺</p>` : ""}
        <p><strong>Kargo:</strong> ${order.shippingPrice === 0 ? "Ücretsiz" : `${order.shippingPrice} ₺`}</p>
        <p style="font-size:16px;font-weight:bold;color:#1a2744">Toplam: ${order.totalPrice.toFixed(2)} ₺</p>
        <a href="https://www.kovankirtasiye.com.tr/profile"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a2744;color:white;text-decoration:none;border-radius:8px;font-weight:600">
          Siparişimi Görüntüle
        </a>
      </div>
    `,
  });
}

// Admin'e: ödeme alındı
async function sendPaymentReceivedToAdmin(order) {
  const orderNo = orderNoOf(order);

  await resend.emails.send({
    from: MAIL_FROM,
    to: process.env.EMAIL_USER,
    subject: `✅ Ödeme Alındı! Sipariş #${orderNo}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
        <h2 style="color:#16a34a">✅ Ödeme Başarıyla Alındı</h2>
        <p><strong>Sipariş No:</strong> #${orderNo}</p>
        <p><strong>Müşteri:</strong> ${escapeHtml(order.shippingAddress.name)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(order.shippingAddress.phone)}</p>
        ${itemsTableHtml(order.orderItems)}
        <p style="font-size:18px;font-weight:bold;color:#1a2744">Tahsil Edilen Tutar: ${order.totalPrice.toFixed(2)} ₺</p>
        <a href="https://www.kovankirtasiye.com.tr/admin/orders"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:white;text-decoration:none;border-radius:8px;font-weight:600">
          Admin Panele Git
        </a>
      </div>
    `,
  });
}

module.exports = {
  escapeHtml,
  sendOrderReceivedToCustomer,
  sendPaymentReceivedToAdmin,
};
