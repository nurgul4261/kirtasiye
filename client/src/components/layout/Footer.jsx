import { useState } from "react";
import "./Footer.css";

export default function Footer() {
  const [modalContent, setModalContent] = useState(null);

  // Sözleşme metinleri taslakları
  const legalTexts = {
    kvkk: {
      title: "KVKK Aydınlatma Metni",
      text: `Kovan Kırtasiye olarak, kişisel verilerinizin güvenliğine önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, web sitemiz üzerinden toplanan ad, soyad, e-posta ve iletişim bilgileriniz; siparişlerinizin işleme alınması, faturalandırılması, ürün teslimatının yapılması ve müşteri hizmetleri süreçlerinin yürütülmesi amacıyla işlenmektedir. Verileriniz, yasal yükümlülüklerin gerektirdiği durumlar haricinde üçüncü taraflarla paylaşılmaz. Dilediğiniz zaman tarafımıza başvurarak verilerinizin silinmesini veya düzeltilmesini talep edebilirsiniz.`,
    },
    mesafeli: {
      title: "Mesafeli Satış Sözleşmesi",
      text: `1. TARAFLAR: İşbu sözleşme, Kovan Kırtasiye (Satıcı) ile web sitesi üzerinden sipariş oluşturan kullanıcı (Alıcı) arasında akdedilmiştir.\n2. SÖZLEŞMENİN KONUSU: Alıcı'nın, Satıcı'ya ait e-ticaret sitesinden elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.\n3. TESLİMAT VE İADE: Sipariş edilen kırtasiye ürünleri, hobi kitleri veya kutu oyunları, yasal 30 günlük süreyi aşmamak kaydıyla Alıcı'nın belirttiği adrese kargo ile teslim edilir. Alıcı, ürünü teslim aldığı tarihten itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin cayma hakkına sahiptir. Özel üretim veya paketi açılmış sarf malzemelerinde cayma hakkı geçerli değildir.`,
    },
    gizlilik: {
      title: "Gizlilik Sözleşmesi ve Politikası",
      text: `Kovan Kırtasiye, kullanıcıların kişisel gizliliğini korumayı taahhüt eder. Sitemizde işlem yaparken verdiğiniz kredi kartı ve ödeme bilgileri doğrudan güvenli ödeme altyapısı (PayTR vb.) tarafından işlenir; kesinlikle sistemlerimizde saklanmaz. Çerezler (cookies), yalnızca site deneyiminizi iyileştirmek, sepetinizi hatırlamak ve istatistiksel analizler yapmak amacıyla kullanılır. Bilgileriniz en yüksek güvenlik standartları ve SSL sertifikaları ile korunmaktadır.`,
    },
    hakkimizda: {
      title: "Hakkımızda",
      text: `Kovan Kırtasiye, hobi tutkunlarını, kırtasiye aşıklarını ve kutu oyunu severleri ortak bir "kovanda" buluşturmak amacıyla kuruldu. Özenle seçilmiş kalemlerden defterlere, yaratıcılığınızı besleyecek hobi kitlerinden sevdiklerinizle keyifli vakit geçireceğiniz kutu oyunlarına kadar geniş bir ürün yelpazesi sunuyoruz. Amacımız, dijitalleşen dünyada analog dokunuşların ve üretkenliğin tadını çıkarmanızı sağlayacak kaliteli ürünleri en modern e-ticaret deneyimiyle kapınıza getirmektir.`,
    },
  };

  const openModal = (type) => {
    setModalContent(legalTexts[type]);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <footer className="footer">
      <div className="container footer-layout">
        {/* Sütun 1: Logo / Tanım */}
        <div className="footer-col brand-col">
          <h3 className="footer-logo">Kovan Kırtasiye</h3>
          <p>
            Defter, kutu oyunları, hediyelik ve hobi kitleri ile hayatınıza renk
            katın.
          </p>
        </div>

        {/* Sütun 2: Kurumsal */}
        <div className="footer-col">
          <h4>Kurumsal</h4>
          <ul>
            <li>
              <button
                onClick={() => openModal("hakkimizda")}
                className="footer-link-btn"
              >
                Hakkımızda
              </button>
            </li>
            <li>
              <a href="/contact">İletişim</a>
            </li>{" "}
            {/* Navbar'daki iletişim rotana yönlendirir */}
          </ul>
        </div>

        {/* Sütun 3: Sözleşmeler */}
        <div className="footer-col">
          <h4>Sözleşmeler</h4>
          <ul>
            <li>
              <button
                onClick={() => openModal("kvkk")}
                className="footer-link-btn"
              >
                KVKK Aydınlatma Metni
              </button>
            </li>
            <li>
              <button
                onClick={() => openModal("mesafeli")}
                className="footer-link-btn"
              >
                Mesafeli Satış Sözleşmesi
              </button>
            </li>
            <li>
              <button
                onClick={() => openModal("gizlilik")}
                className="footer-link-btn"
              >
                Gizlilik Sözleşmesi
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>
            © 2026 <span>Kovan Kırtasiye</span>. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* Ortak Modal Yapısı */}
      {modalContent && (
        <div className="footer-modal-overlay" onClick={closeModal}>
          <div
            className="footer-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="footer-modal-header">
              <h3>{modalContent.title}</h3>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="footer-modal-body">
              {modalContent.text.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
