import { useState } from "react";
import "./Footer.css";

export default function Footer() {
  const [modalContent, setModalContent] = useState(null);

  // Sözleşme metinleri taslakları
  const legalTexts = {
    kvkk: {
      title: "KVKK Aydınlatma Metni",
      text: `Yürürlük Tarihi: 09.06.2026

1. VERİ SORUMLUSU
6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla aşağıda bilgileri yer alan firma tarafından işlenmektedir:

Ticari Ünvanı: Kovan Kırtasiye

İnternet Sitesi: www.kovankirtasiye.com.tr

Merkez Adres: Mehmet Akif Mahallesi Zehra Sokak No:19D Selçuklu / Konya

E-posta: kovankirtasiye@gmail.com

Telefon: 0538 554 53 34

İşbu Aydınlatma Metni; www.kovankirtasiye.com.tr internet sitesi üzerinden gerçekleştirilen üyelik, sipariş, ödeme, kargo, iade, müşteri hizmetleri, iletişim formları ve kampanya süreçleri kapsamında işlenen kişisel veriler hakkında kullanıcıları, üyeleri ve ziyaretçileri bilgilendirmek amacıyla hazırlanmıştır.

2. İŞLENEN KİŞİSEL VERİLER
Kovan Kırtasiye tarafından işin doğası gereği işlenebilecek kişisel veri kategorileri aşağıda belirtilmiştir:

Kimlik Bilgileri: Ad, soyad; fatura düzenlenmesi gereken durumlarda (varsa) şirket unvanı ve vergi dairesi/numarası bilgileri. (Firmamız tarafından kural olarak T.C. Kimlik Numarası talep edilmemekte olup, zorunlu değildir).

İletişim Bilgileri: E-posta adresi, telephone numarası, cep telefonu, teslimat adresi, fatura adresi ve müşteri hizmetleri kanallarıyla iletilen iletişim detayları.

Üyelik ve Hesap Bilgileri: Kullanıcı adı, şifre/parola bilgisinin teknik olarak şifrelenmiş güvenli özeti, hesap tercihleri, favoriler, sepet bilgileri ve üyelik geçmişi.

Müşteri İşlem Bilgileri: Sipariş bilgileri, satın alınan ürünler, sepet geçmişi, fatura bilgileri, teslimat ve kargo takip bilgileri, iade/değişim/cayma talepleri, müşteri yorumları ve destek kayıtları.

Finans ve Ödeme Bilgileri: Ödeme tutarı, ödeme tarihi, banka işlem referansı, ödeme onay veya ret bilgisi. Kredi/banka kartı ile yapılan ödemelerde kart bilgileri doğrudan anlaşmalı ödeme kuruluşu (PayTR vb.) ve banka altyapısı tarafından işlenir; Kovan Kırtasiye kart numarası ve CVV gibi hassas verileri kendi sistemlerinde kesinlikle saklamaz.

İşlem Güvenliği ve Teknik Veriler: IP adresi, cihaz ve tarayıcı bilgisi, işletim sistemi, site giriş-çıkış kayıtları, işlem logları ve çerez (cookie) kayıtları.

Pazarlama Bilgileri: Ticari elektronik ileti izin/ret kayıtları, kampanya katılım bilgileri, alışveriş tercihleri ve anket/memnuniyet bilgileri.

Özel Nitelikli Kişisel Veriler hakkında bilgilendirme: Kovan Kırtasiye, kullanıcılardan doğrudan özel nitelikli kişisel veri talep etmez. Ancak satın alınan hobi ürünleri, kitaplar veya spesifik materyallerin içeriği, doğası gereği kişilerin ilgi alanlarına dair dolaylı çıkarımlara neden olabilir. Bu veriler yalnızca siparişin yerine getirilmesi ve yasal yükümlülükler amacıyla işlenir; asla uygunsuz profilleme veya ayrımcılık amacıyla kullanılamaz.

3. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI VE HUKUKİ SEBEPLERİ
Toplanan kişisel verileriniz, KVKK’nın 5. ve 6. maddelerinde belirtilen şartlar dahilinde aşağıdaki amaçlar ve hukuki sebeplerle işlenmektedir:

A) Sözleşmenin Kurulması veya İfası İçin Gerekli Olması Durumunda:
Üyelik işlemlerinin gerçekleştirilmesi, sepet özelliklerinin sunulması ve üye girişinin sağlanması,
Siparişlerin alınması, mesafeli satış sözleşmesinin kurulması, ürünlerin paketlenmesi, faturalandırılması ve kargo süreçlerinin yönetilmesi,
İade, değişim, cayma hakkı süreçlerinin ve müşteri taleplerinin sonuçlandırılması.

B) Kanunlarda Açıkça Öngörülmesi ve Hukuki Yükümlülüklerin Yerine Getirilmesi Durumunda:
6502 sayılı Tüketicinin Korunması Hakkında Kanun, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve Vergi Usul Kanunu uyarınca fatura, muhasebe ve ticari defter kayıtlarının tutulması,
Yetkili kamu kurum ve kuruluşlarından (savcılık, mahkemeler vb.) gelen yasal bilgi taleplerinin karşılanması.

C) Veri Sorumlusunun Meşru Menfaatleri İçin Zorunlu Olması Durumunda:
Bilgi güvenliğinin sağlanması, sahte işlem, dolandırıcılık ve kötüye kullanım risklerinin önlenmesi,
Sistem hatalarının giderilmesi, site deneyiminin iyileştirilmesi ve hizmet kalitesinin artırılması.

D) Açık Rızanızın Bulunması Durumunda:
Onay vermeniz halinde kampanya, indirim, yeni ürün duyuruları, e-bülten gönderimleri ve pazarlama faaliyetlerinin yürütülmesi.

4. KİŞİSEL VERİLERİN AKTARILABİLECEĞİ ÜÇÜNCÜ KİŞİLER
Kişisel verileriniz, yukarıda belirtilen amaçlarla sınırlı, ölçülü ve yalnızca hizmetin gerektirdiği ölçüde aşağıdaki kişi ve kuruluşlarla paylaşılabilir:
Sipariş teslimatlarının yapılabilmesi adına anlaşmalı kargo ve lojistik firmaları,
Ödeme süreçlerinin güvenle tamamlanabilmesi adına lisanslı ödeme kuruluşları ve bankalar,
Sitenin teknik işleyişi adına e-ticaret altyapı, hosting ve sunucu hizmet sağlayıcıları,
Yasal beyannameler ve muhasebe süreçleri adına mali müşavirler ve e-fatura hizmet sağlayıcıları,
Hukuki uyuşmazlıklarda şirket haklarının korunması adına hukuk danışmanları ve mevzuat gereği yetkili kamu kurumları.

Kişisel verileriniz kural olarak yurt dışına aktarılmamaktadır. İlerleyen süreçte global bulut/analitik altyapıları nedeniyle gerekmesi halinde, bu işlem KVKK mevzuatına uygun olarak açık rızanız doğrultusunda gerçekleştirilir.

5. KİŞİSEL VERİLERİN SAKLANMASI VE KORUNMASI
Kişisel verileriniz, Kovan Kırtasiye nezdindeki veri tabanlarında KVKK’nın 12. maddesi gereğince gizli olarak saklanacaktır. Veriler, işleme amacının gerektirdiği süre boyunca veya ilgili ticari/tüketici mevzuatında öngörülen yasal zamanaşımı süreleri kadar muhafaza edilir. Sürenin dolması halinde verileriniz silinir, yok edilir veya anonim hale getirilir.

Firmamız; yetkisiz erişimleri engellemek, veri kayıplarını önlemek ve siber güvenlik risklerini azaltmak adına SSL şifreleme, erişim yönetimi ve gerekli tüm teknik idari tedbirleri almaktadır.

6. 18 YAŞ ALTI KULLANICILAR
www.kovankirtasiye.com.tr internet sitesinden üyelik oluşturulması ve alışveriş işlemlerinin 18 yaşından büyük kişiler tarafından yapılması esastır. 18 yaşından küçük bir kullanıcının yasal temsilci izni olmaksızın kişisel veri paylaştığının tespit edilmesi halinde, söz konusu veriler sistemimizden derhal silinecektir.

7. KVKK KAPSAMINDAKİ HAKLARINIZ
KVKK’nın 11. maddesi uyarınca, Kovan Kırtasiye’ye başvurarak kendinizle ilgili aşağıdaki hakları kullanabilirsiniz:
Kişisel veri işlenip işlenmediğini öğrenme,
Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,
İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,
Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,
KVKK’nın 7. maddesinde öngörülen şartlar çerçevesinde verilerin silinmesini veya yok edilmesini isteme,
Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere de bildirilmesini isteme,
İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,
Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.

8. BAŞVURU YÖNTEMİ
Yukarıda sayılan haklarınıza ilişkin taleplerinizi; ad, soyad, iletişim bilgileri ve talep konusunu net olarak belirterek, kimliğinizi doğrulayıcı belgelerle birlikte Mehmet Akif Mahallesi Zehra Sokak No:19D Selçuklu / Konya adresine yazılı olarak (elden veya iadeli taahhütlü posta ile) ya da sisteme kayıtlı e-posta adresiniz üzerinden kovankirtasiye@gmail.com adresine mail göndererek iletebilirsiniz. Talepleriniz en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.`,
    },
    mesafeli: {
      title: "Mesafeli Satış Sözleşmesi",
      text: `1. TARAFLAR
İşbu Sözleşme aşağıdaki taraflar arasında, aşağıda belirtilen hüküm ve şartlar çerçevesinde elektronik ortamda kurulmuştur.
'ALICI' (Sözleşmede bundan sonra "ALICI" olarak anılacaktır):
Ad - Soyad / Ünvan	[alici-adi]
Adres	[alici-adres]
Telefon	[alici-telefon]
E-posta	[alici-eposta]
'SATICI' (Sözleşmede bundan sonra "SATICI" olarak anılacaktır):
Ticari Ünvanı	Kovan Kırtasiye
Adres	Mehmet Akif Mahallesi Zehra Sokak No:19D Selçuklu / Konya
Telefon	0538 554 53 34
E-posta	kovankirtasiye@gmail.com
Web Adresi	www.kovankirtasiye.com.tr

İşbu sözleşmeyi kabul etmekle ALICI, sözleşme konusu siparişi onayladığı takdirde sipariş konusu bedeli ve varsa kargo ücreti, vergi gibi belirtilen ek ücretleri ödeme yükümlülüğü altına gireceğini ve bu konuda peşinen bilgilendirildiğini kabul eder.
2. TANIMLAR
KANUN: 6502 sayılı Tüketicinin Korunması Hakkında Kanun'u,
YÖNETMELİK: Mesafeli Sözleşmeler Yönetmeliği'ni (RG: 27.11.2014/29188),
BAKANLIK: Ticaret Bakanlığı'nı,
SATICI: Ticari veya mesleki faaliyetleri kapsamında tüketiciye mal veya hizmet sunan Kovan Kırtasiye şirketini,
ALICI: Bir mal veya hizmeti ticari veya mesleki olmayan amaçlarla edinen, kullanan veya yararlanan gerçek ya da tüzel kişiyi,
SİTE: SATICI'ya ait www.kovankirtasiye.com.tr internet sitesini,
SİPARİŞ VEREN: Bir mal veya hizmeti SATICI'ya ait internet sitesi üzerinden talep eden gerçek ya da tüzel kişiyi,
TARAFLAR: SATICI ve ALICI'yı,
SÖZLEŞME: SATICI ve ALICI arasında akdedilen işbu sözleşmeyi,
MAL/ÜRÜN: Alışverişe konu olan taşınır eşyayı ve elektronik ortamda kullanılmak üzere hazırlanan yazılım, ses, görüntü ve benzeri gayri maddi malları ifade eder.
3. KONU
İşbu Sözleşme, ALICI'nın, SATICI'ya ait internet sitesi üzerinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı sitede belirtilen ürünün/ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerini düzenler.
Listelenen ve sitede ilan edilen fiyatlar satış fiyatıdır. İlan edilen fiyatlar ve vaatler güncelleme yapılana ve değiştirilene kadar geçerlidir. Süreli olarak ilan edilen fiyatlar ise belirtilen süre sonuna kadar geçerlidir.
4. TESLİMAT, SİPARİŞ VEREN VE FATURA BİLGİLERİ
Ürünün adı, adedi, KDV dahil satış bedeli, ödeme şekli ve teslimat adresi, siparişin tamamlandığı andaki bilgiler uyarınca otomatik olarak sipariş onay ekranına ve ALICI'ya gönderilen sipariş e-postasına yansıtılır. Aşağıdaki bilgiler her sipariş için ayrı ayrı kayıt altına alınır:
Teslim Edilecek Kişi	[teslim-alan-adi]
Teslimat Adresi	[teslimat-adresi]
Sipariş Veren (farklı ise)	[siparis-veren-adi]
Fatura Adresi	[fatura-adresi]
Sipariş Tarihi	[siparis-tarihi]
Teslimat Tarihi	[teslimat-tarihi]
Teslim Şekli	[kargo-firmasi]

Ödeme Şekli: ALICI tarafından sipariş esnasında seçilen ödeme yöntemi (Kredi Kartı / Banka Kartı / Havale-EFT) geçerlidir.
Kargo ve Teslimat: Ürün sevkiyat masrafı olan kargo ücreti, aksine bir kampanya ilan edilmediği sürece ALICI tarafından ödenir. Sözleşme konusu her bir ürün, yasal 30 günlük süreyi aşmamak kaydıyla, internet sitesindeki ön bilgilerde belirtilen süre zarfında ALICI veya ALICI'nın gösterdiği adresteki kişi/kuruluşa teslim edilir. Bu süre içinde ürünün teslim edilememesi halinde ALICI'nın sözleşmeyi feshetme hakkı saklıdır.
5. GENEL HÜKÜMLER
5.1. ALICI, SİTE'de sözleşme konusu ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul, beyan ve taahhüt eder.
5.2. 18 yaşından küçük kişiler www.kovankirtasiye.com.tr sitesinden alışveriş yapamaz. SATICI, ALICI'nın yaşını kontrol etmekle yükümlü tutulamaz; ALICI'nın beyanı esas alınır.
5.3. SATICI, sözleşme konusu ürünü eksiksiz, siparişte belirtilen niteliklere uygun, varsa garanti belgeleri ve kullanım kılavuzları ile birlikte, yasal mevzuat gereklerine göre sağlam ve ayıpsız olarak teslim etmeyi; hizmet kalitesini koruyup yükseltmeyi, işin ifası sırasında gerekli dikkat ve özeni göstermeyi kabul, beyan ve taahhüt eder.
5.4. SATICI, sözleşmeden doğan ifa yükümlülüğünün süresi dolmadan ALICI'yı bilgilendirmek ve açıkça onayını almak suretiyle eşit kalite ve fiyatta farklı bir ürün tedarik edebilir.
5.5. SATICI, sipariş konusu ürün veya hizmetin yerine getirilmesinin imkânsızlaşması halinde, bu durumu öğrendiği tarihten itibaren 3 gün içinde yazılı olarak veya kalıcı veri saklayıcısı ile ALICI'ya bildireceğini ve 14 gün içinde toplam bedeli ALICI'ya iade edeceğini kabul, beyan ve taahhüt eder.
5.6. Kovan Kırtasiye, sitede listelenen ürünlerin stok durumlarını sürekli güncellemekle birlikte, tedarikçi/yayıncı kuruluşların stoklarında yaşanabilecek tükenmeler nedeniyle gecikme veya teslim edememe durumu ortaya çıkabilir. Bu halde ALICI e-posta veya telefon ile bilgilendirilir ve ödediği tutar aynen iade edilir.
5.7. ALICI, Sözleşme konusu ürünün ALICI veya ALICI'nın gösterdiği adresteki kişi/kuruluşa tesliminden sonra ALICI'ya ait ödeme aracının yetkisiz kişilerce haksız kullanılması sonucunda sözleşme konusu ürün bedelinin ilgili banka veya finans kuruluşu tarafından SATICI'ya ödenmemesi halinde, ürünü 3 gün içinde nakliye gideri SATICI'ya ait olacak şekilde SATICI'ya iade edeceğini kabul, beyan ve taahhüt eder.
5.8. Kargo teslimatı sırasında yırtılmış, ezilmiş veya hasara uğramış paketler ALICI tarafından kesinlikle teslim alınmamalı, kargo görevlisine hasar tespit tutanağı tutturulmalıdır. Tutanak tutulmadan teslim alınan paketlerde kargo firmasının ya da SATICI'nın sorumluluğu bulunmamaktadır. Teslim alınan mal/hizmetin hasarsız ve sağlam olduğu kabul edilir; teslimden sonra malın özenle korunması borcu ALICI'ya aittir.
5.9. SATICI, tarafların iradesi dışında gelişen, önceden öngörülemeyen ve tarafların borçlarını yerine getirmesini engelleyici ve/veya geciktirici mücbir sebep hallerinin (doğal afet, salgın hastalık, yangın, grev, mevzuat değişikliği, altyapı/kargo kesintisi vb.) oluşması nedeniyle sözleşme konusu ürünü süresi içinde teslim edemezse, durumu ALICI'ya derhal bildirir. ALICI bu halde; siparişin iptal edilmesini, ürünün varsa emsali ile değiştirilmesini ve/veya teslimat süresinin engelleyici durumun ortadan kalkmasına kadar ertelenmesini talep edebilir. Sipariş iptalinde ödenen tutar, ödeme şekline uygun olarak 14 gün içinde ALICI'ya iade edilir.
5.10. SATICI'nın, ALICI tarafından siteye üyelik/sipariş sırasında verilen veya sonradan güncellenen adres, e-posta, telefon ve diğer iletişim bilgileri üzerinden mektup, e-posta, SMS, telefon görüşmesi ve benzeri yollarla iletişim, pazarlama, bildirim ve diğer amaçlarla ALICI'ya ulaşma hakkı bulunmaktadır. ALICI, işbu sözleşmeyi kabul etmekle SATICI'nın kendisine yönelik bu iletişim faaliyetlerinde bulunabileceğini kabul eder; ticari elektronik iletiler için ayrıca alınan onay saklı kalmak kaydıyla, ALICI dilediği zaman bu iletişimden çıkma (ret) hakkına sahiptir.
5.11. ALICI ile sipariş esnasında kullanılan ödeme aracı sahibinin aynı kişi olmaması veya ürünün ALICI'ya tesliminden evvel ödeme aracına ilişkin bir güvenlik açığı tespit edilmesi halinde, SATICI kart/hesap hamiline ilişkin kimlik ve iletişim bilgilerini, bir önceki aya ait hesap ekstresini ya da bankadan alınacak sahiplik yazısını ALICI'dan talep edebilir. Talep edilen bilgi/belgeler temin edilene kadar sipariş dondurulur; taleplerin 24 saat içinde karşılanmaması halinde SATICI siparişi iptal etme hakkına sahiptir.
5.12. ALICI, siteye üye olurken veya sipariş verirken beyan ettiği kişisel ve diğer bilgilerin doğru ve güncel olduğunu; bu bilgilerin gerçeğe aykırılığından doğacak zararları SATICI'nın ilk bildirimi üzerine derhal, nakden ve defaten tazmin edeceğini kabul, beyan ve taahhüt eder.
5.13. ALICI, SİTE'yi kullanırken yürürlükteki mevzuat hükümlerine uymayı; kamu düzenini bozucu, genel ahlaka aykırı, başkalarını rahatsız veya taciz edici, hukuka aykırı bir amaç için ya da başkalarının maddi/manevi haklarına tecavüz edecek şekilde SİTE'yi kullanmamayı; spam, virüs, zararlı yazılım vb. yollarla diğer kullanıcıların hizmetten yararlanmasını engelleyici faaliyetlerde bulunmamayı kabul ve taahhüt eder. Aksi halde doğacak tüm hukuki ve cezai sorumluluk ALICI'ya aittir; SATICI'nın bu ihlaller nedeniyle tazminat talep etme hakkı saklıdır.
5.14. SİTE üzerinden, SATICI'nın kendi kontrolünde olmayan üçüncü kişilere ait web sitelerine veya içeriklere bağlantı (link) verilebilir. Bu bağlantılar yalnızca yönlendirme kolaylığı sağlamak amacıyla konulmuş olup, ilgili sitenin veya işletenin desteklendiği anlamına gelmez; SATICI bu sitelerin içeriğine ilişkin herhangi bir garanti vermez.
6. CAYMA HAKKI
6.1. ALICI; mal satışına ilişkin mesafeli sözleşmelerde, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, ürünün kendisine veya gösterdiği adresteki üçüncü kişiye teslim tarihinden itibaren 14 (on dört) gün içerisinde SATICI'ya bildirmek şartıyla sözleşmeden cayma hakkını kullanabilir. Hizmet sunumuna ilişkin sözleşmelerde bu süre, sözleşmenin kurulduğu tarihten itibaren başlar; ancak cayma hakkı süresi dolmadan ALICI'nın onayı ile hizmetin ifasına başlanmışsa cayma hakkı kullanılamaz. Cayma hakkının kullanılmasından kaynaklanan masraflar SATICI'ya aittir.
6.2. Cayma hakkının kullanılması için 14 günlük süre içinde SATICI'ya e-posta (kovankirtasiye@gmail.com), yazılı bildirim veya faks yoluyla bildirimde bulunulması ve ürünün 7. maddede sayılan istisnalar dışında kalması ile ambalajının açılmamış, denenmemiş, bozulmamış ve kullanılmamış olması şarttır. Bu hakkın kullanılması halinde:
a) 3. kişiye veya ALICI'ya teslim edilen ürünün faturasının aslı (kurumsal faturalarda, kurum tarafından düzenlenmiş iade faturası ile birlikte) iade edilmelidir; iade faturası kesilmeyen kurumsal iadeler tamamlanamaz.
b) İade formu doldurularak gönderilmelidir.
c) İade edilecek ürünlerin kutusu, ambalajı ve varsa standart aksesuarları ile birlikte eksiksiz ve hasarsız olarak teslim edilmesi gerekmektedir.
6.3. SATICI, cayma bildiriminin kendisine ulaşmasından itibaren en geç 14 gün içerisinde toplam bedeli ve ALICI'yı borç altına sokan belgeleri, ALICI'nın ödemede kullandığı araca uygun şekilde iade etmekle; ALICI ise SATICI'nın malı geri çağırdığı tarihten itibaren 10 gün içinde malı iade etmekle yükümlüdür. Kredi kartına yapılan iadelerin ALICI hesabına yansıma süreci tamamen ilgili bankanın işlem sürecine bağlıdır; SATICI bu süreçten kaynaklanan gecikmelerden sorumlu tutulamaz.
6.4. ALICI'nın kusurundan kaynaklanan bir nedenle malın değerinde bir azalma olursa veya iade imkânsızlaşırsa, ALICI kusuru oranında SATICI'nın zararını tazmin etmekle yükümlüdür. Malın veya ürünün cayma hakkı süresi içinde usulüne uygun kullanılması sebebiyle meydana gelen değişiklik ve bozulmalardan ALICI sorumlu değildir.
6.5. Cayma hakkının kullanılması nedeniyle, SATICI tarafından düzenlenen bir kampanyanın asgari sepet tutarının altına düşülmesi halinde, kampanya kapsamında faydalanılan indirim miktarı iptal edilir.
7. CAYMA HAKKI KULLANILAMAYACAK ÜRÜNLER
Mevzuat gereği; ALICI'nın isteği veya açıkça kişisel ihtiyaçları doğrultusunda hazırlanan (kişiye özel tasarlanan/üretilen/isim baskılı vb.) ürünler; iç giyim alt parçaları, mayo ve bikini altları, makyaj malzemeleri gibi tek kullanımlık ürünler; çabuk bozulma tehlikesi olan veya son kullanma tarihi geçme ihtimali bulunan mallar; ALICI tarafından ambalajı açıldığı takdirde iadesi sağlık ve hijyen açısından uygun olmayan ürünler; teslim edildikten sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler; abonelik sözleşmesi kapsamında sağlananlar dışında gazete ve dergi gibi süreli yayınlara ilişkin mallar; elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallar ile ambalajı ALICI tarafından açılmış olan ses/görüntü kayıtları, kitap, dijital içerik, yazılım programları, veri kaydedebilme ve veri depolama cihazları ile bilgisayar sarf malzemelerinin (toner, kartuş, şerit vb.) iadesi Yönetmelik gereği mümkün değildir.
Kozmetik ve kişisel bakım ürünleri, iç giyim ürünleri, mayo, bikini, kitap, kopyalanabilir yazılım ve programlar, DVD, VCD, CD ve kasetler ile kırtasiye sarf malzemelerinin (toner, kartuş, şerit vb.) iade edilebilmesi için ambalajlarının açılmamış, denenmemiş, bozulmamış ve kullanılmamış olması gerekir.
Ayrıca, cayma hakkı süresi sona ermeden önce, ALICI'nın onayı ile ifasına başlanan hizmetlere ilişkin cayma hakkı Yönetmelik gereği kullanılamaz.
8. TEMERRÜT HALİ VE HUKUKİ SONUÇLARI
ALICI, ödeme işlemlerini kredi kartı ile yaptığı durumda temerrüde düştüğü takdirde, kart sahibi banka ile arasındaki kredi kartı sözleşmesi çerçevesinde faiz ödeyeceğini ve bankaya karşı sorumlu olacağını kabul, beyan ve taahhüt eder. Bu durumda ilgili banka hukuki yollara başvurabilir; doğacak masrafları ve vekâlet ücretini ALICI'dan talep edebilir. ALICI'nın borcunu gecikmeli ifa etmesi halinde, bu gecikmeden dolayı SATICI'nın uğradığı zarar ve ziyanı ödeyeceğini kabul, beyan ve taahhüt eder.
9. YETKİLİ MAHKEME
İşbu sözleşmeden doğan uyuşmazlıklarda şikâyet ve itirazlar, her yıl Ticaret Bakanlığı tarafından ilan edilen parasal sınırlar dâhilinde, ALICI'nın yerleşim yerinin bulunduğu veya tüketici işleminin yapıldığı yerdeki Tüketici Hakem Heyetlerine veya Tüketici Mahkemelerine yapılacaktır.
10. YÜRÜRLÜK
ALICI, Site üzerinden verdiği siparişe ait ödemeyi gerçekleştirdiğinde işbu sözleşmenin tüm şartlarını okuyup kabul etmiş sayılır. SATICI, siparişin gerçekleşmesi öncesinde işbu sözleşmenin sitede ALICI tarafından okunup kabul edildiğine dair yazılımsal onayı (check-box / elektronik teyit) almakla yükümlüdür.

SATICI	Kovan Kırtasiye
ALICI	[alici-adi]
TARİH	[siparis-tarihi]
`,
    },
    gizlilik: {
      title: "Gizlilik Sözleşmesi ve Politikası",
      text: `www.kovankirtasiye.com.tr internet sitesinde verilen tüm servisler ve hizmetler, Mehmet Akif Mahallesi Zehra Sokak No:19D Selçuklu / Konya adresinde mukim Kovan Kırtasiye firmamıza aittir ve firmamız tarafından işletilir.

Firmamız, kullanıcılarımızın gizliliğine ve kişisel verilerinin güvenliğine yüksek derecede önem vermekte olup, uluslararası mahremiyet koruma standartlarına ve yasal mevzuata uymayı taahhüt eder. İşbu "Gizlilik ve Güvenlik Politikası", sitemizi ziyaret eden ve alışveriş yapan kullanıcıların haklarını korumak amacıyla tasarlanmıştır.

1. KİŞİSEL VERİLERİN TOPLANMASI VE KULLANIMI
Üyelik işlemleri, sipariş formları veya sitemiz üzerindeki çeşitli anket ve formların doldurulması suretiyle, işin doğası gereği kullanıcılarımıza ait bir takım kişisel bilgiler (isim-soyisim, telefon, adres veya e-posta adresleri gibi) firmamız tarafından toplanmaktadır.

Bu bilgiler, tamamen kullanıcının özgür iradesiyle sağlanmakta olup, firmamız tarafından aşağıdaki amaçlar dışında kesinlikle kullanılmayacaktır:
Siparişlerinizi almak ve faturalandırma süreçlerini yönetmek,
Satın aldığınız ürünlerin teslimatını (kargo işlemlerini) gerçekleştirmek,
Siparişleriniz, ürünlerimiz ve hizmetlerimiz hakkında bilgilendirmelerde bulunmak,
Sorularınızı yanıtlamak ve etkin bir müşteri hizmeti sunmak.

Kişisel bilgiler, yasal zorunluluklar ve resmi makamların usulüne uygun talepleri haricinde, kullanıcının bizzat onayı olmadan üçüncü şahıslara satılmaz, kiralanmaz veya ticari amaçla paylaşılmaz.

2. TİCARİ ELEKTRONİK İLETİLER
Firmamız, bazı dönemlerde müşterilerine ve üyelerine kampanya bilgileri, yeni ürünler hakkında bilgilendirmeler ve promosyon teklifleri gönderebilir. Üyelerimiz, bu tür ticari iletileri alıp almama konusundaki tercihlerini üye olurken serbestçe yapabilirler. Sonrasında ise üye girişi yaparak "Hesap Bilgileri" bölümünden bu seçimi diledikleri zaman değiştirebilir ya da kendisine gelen bilgilendirme iletisindeki link aracılığıyla gönderim listesinden kolayca çıkabilirler.

3. KREDİ KARTI VE ÖDEME GÜVENLİĞİ
Firmamız, web sitemizden alışveriş yapan kredi kartı sahiplerinin güvenliğini ilk planda tutmaktadır. Kredi kartı bilgileriniz hiçbir şekilde bizim sistemimizde veya veri tabanımızda saklanmamaktadır.

Şifreleme Standartları: Alışveriş sırasında kullanılan kredi kartı ile ilgili bilgiler web sitemizden bağımsız olarak SSL (Secure Sockets Layer) protokolü ile şifrelenip sorgulanmak üzere doğrudan ilgili banka veya ödeme altyapısına (PayTR vb.) ulaştırılır. Kartla ilgili hiçbir bilgi tarafımızdan görüntülenemez ve kaydedilemez.

Güvenlik Kontrolü: Online olarak kredi kartı ile verilen siparişlerin ödeme/fatura/teslimat adresi bilgilerinin güvenilirliği, kredi kartları dolandırıcılığına karşı denetlenmektedir. Gerekli görüldüğü durumlarda finansal ve adres bilgilerinin doğruluğunu onaylamak adına müşteri ile veya ilgili banka ile irtibata geçilebilir.

4. SİSTEM LOGLARI VE IP ADRESLERİ
Sistemle ilgili sorunların tanımlanması ve verilen hizmetle ilgili çıkabilecek uyuşmazlıkların hızla çözülmesi için firmamız, kullanıcıların IP adreslerini kaydedebilir ve analiz edebilir. IP adresleri, kullanıcıları genel bir şekilde tanımlamak ve kapsamlı demografik bilgi toplamak amacıyla da kullanılabilir. Bu log bilgileri, kullanım veya gizlilik politikamız ihlal edilmediği sürece, herhangi bir kişisel bilgi ile doğrudan eşleştirilmez.

5. TARAYICI ÇEREZLERİ (COOKIES)
Firmamız, mağazamızı ziyaret eden kullanıcılar ve kullanıcıların web sitesini kullanımı hakkındaki bilgileri teknik bir iletişim dosyası (Çerez-Cookie) kullanarak elde edebilir. Çerezler, web sitesinin durum ve tercihlerinizi saklayarak internet kullanımını kolaylaştıran küçük metin dosyalarıdır.

Çerezler, ana bellekten veya e-postanızdan veri ya da kişisel bilgi almak için tasarlanmamıştır. Tarayıcıların pek çoğu çerezleri kabul edecek şekilde tasarlanmıştır; ancak kullanıcılar dilerse çerezlerin gelmemesini veya çerez gönderildiğinde uyarı verilmesini sağlayacak biçimde tarayıcı ayarlarını değiştirebilirler. Çerezleri tamamen reddetmek, web sitemizin some alanlarının veya kişiselleştirilmiş özelliklerinin düzgün çalışmasını engelleyebilir.

6. ÜÇÜNCÜ TARAF WEB SİTELERİ VE LİNKLER
Web sitemiz dahilinde, kullanıcı kolaylığı sağlamak adına üçüncü kişilerin sahip olduğu başka web sitelerine bağlantılar (linkler) verilebilir. Firmamız, bu linkler vasıtasıyla erişilen sitelerin gizlilik uygulamaları, çerez politikaları veya içeriklerine yönelik herhangi bir sorumluluk taşımamaktadır. İlgili sitelerin kendi gizlilik sözleşmelerinin incelenmesi tavsiye edilir.  

7. E-POSTA GÜVENLİĞİ
Firmamızın Müşteri Hizmetleri’ne, herhangi bir siparişinizle ilgili olarak göndereceğiniz e-postalarda, asla kredi kartı numaranızı veya şifrelerinizi yazmayınız. E-postalarda yer alan bilgiler üçüncü şahıslar tarafından görüntülenebilir. Firmamız, e-postalarınız üzerinden aktarılan bilgilerin güvenliğini hiçbir koşulda garanti edemez.  

8. 18 YAŞ ALTI KULLANICILAR
www.kovankirtasiye.com.tr internet sitesi 18 yaş altındaki çocukların tek başına alışveriş yapması için uygun değildir. Firmamız, bilerek ve isteyerek 18 yaş altındaki çocuklardan kişisel bilgi talep etmez. Eğer bir ebeveyn, çocuğunun kendi rızası olmadan siteye kişisel bilgi girdiğini fark ederse, bu durumun bildirimi halinde söz konusu bilgiler sistemimizden derhal silinir.

9. POLİTİKA DEĞİŞİKLİKLERİ VE YÜRÜRLÜK
Firmamız, işbu "Gizlilik ve Güvenlik Politikası" hükümlerini dilediği zaman sitede yayınlamak suretiyle değiştirebilir. Güncellenen Gizlilik Politikası hükümleri, web sitesinde yayınlandığı tarihte yürürlük kazanır. Kullanıcıların güncel politikalardan haberdar olmak adına bu sayfayı periyodik olarak gözden geçirmesi önerilir.

10. İLETİŞİM BİLGİLERİ
Gizlilik politikamız, kişisel verilerinizin kullanımı veya güvenliği ile ilgili her türlü soru, öneri ve talepleriniz için bizimle aşağıdaki iletişim bilgileri üzerinden her zaman irtibata geçebilirsiniz:

Firma Ünvanı: Kovan Kırtasiye
Adres: Mehmet Akif Mahallesi Zehra Sokak No:19D Selçuklu / Konya
Telefon: 0538 554 53 34
E-posta: kovankirtasiye@gmail.com`,
    },
    iade: {
      title: "İptal ve İade Politikası",
      text: `Kargo, İptal ve İade Politikası
KARGO VE TESLİMAT SÜRESİ
Siparişleriniz, ödeme onayı alındıktan sonra 1-4 iş günü içerisinde kargoya verilir. Kargo şirketinin yoğunluğuna bağlı olarak elinize ulaşma süresi değişiklik gösterebilir. Siparişiniz kargoya verildiğinde, size e-posta/SMS ile bir takip numarası gönderilir; bu numara ile kargonuzun durumunu online olarak takip edebilirsiniz.
2000 TL ve üzeri alışverişlerinizde kargo ücretsizdir. Bu tutarın altındaki siparişlerde kargo ücreti ödeme sayfasında ayrıca gösterilir.
İPTAL VE İADE PROSEDÜRÜ
1. İade ve İptal Süresi Kaç Gündür?
İptal: Sipariş verdiğiniz ürün henüz kargoya verilmediyse, kovankirtasiye@gmail.com adresine mail atarak veya müşteri hizmetlerimizle iletişime geçerek siparişinizi tamamen veya kısmen iptal edebilirsiniz.
İade: www.kovankirtasiye.com.tr'den satın aldığınız ürünleri, teslim aldığınız tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin iade edebilirsiniz.
2. İade Şartları Nelerdir?
Satın aldığınız ürünün iade alınabilmesi için; tahrip edilmemiş, kullanılmamış, ambalajı/ambalaj bandı açılmamış ve tekrar satılabilirliğinin bozulmamış olması gerekmektedir. İade edilecek ürünlerin, ürünle birlikte gönderilen orijinal faturası (varsa tüm aksesuarları ve kutusu) ile birlikte teslim edilmesi zorunludur.
Önemli Not: Mevzuat gereği; ambalajı, bandrolü veya mührü açılmış olan kitaplar, dergiler, kutu oyunları, dijital içerikler ile açıldığında hijyen/sağlık riski oluşturan kırtasiye ve sarf malzemelerinin (kalemler, boyalar, taş/ahşap boyama setleri vb.) iadesi/değişimi, ambalajı açıldıktan sonra mümkün değildir.
3. İade ve Değişimde Kargo Ücretini Kim Öder?
Kusurlu/Hatalı Ürün: Baskısı hatalı, eksik veya fabrikasyon kusuru olan ürünlerde geliş ve gidiş kargo ücreti Kovan Kırtasiye'ye aittir.
Yanlış Ürün Gönderimi: Sipariş ettiğinizden farklı bir ürünün tarafımızdan gönderilmesi durumunda geliş ve gidiş kargo ücreti Kovan Kırtasiye'ye aittir.
Cayma Hakkı / Keyfi İade: Üründen vazgeçilmesi veya yanlış sipariş oluşturulması gibi durumlarda kargo ücreti ALICI'ya (Müşteriye) aittir.
4. Geri Ödeme Süreçleri
İade amacıyla gönderdiğiniz ürünler firmamıza ulaştıktan sonra, uzman ekibimiz tarafından iade politikasına uygunluğu incelenir. Onaylanan iadelerin geri ödeme süreleri şu şekildedir:
Kredi Kartları: İade onayı verildikten sonra en geç 4 iş günü içerisinde bankanıza talimat verilir.
Debit (Banka Kartları): Bankacılık işlem süreçleri nedeniyle tutarın kartınıza yansıması en geç 20 iş günü sürebilir.
Havale / EFT: Bildireceğiniz IBAN numarasına iade tutarı aynı gün içerisinde transfer edilir.
Not: Kredi kartı iadelerinde tutarın ekstrenize yansıma süresi tamamen bankanızın iç süreçlerine bağlı olup, firmamızın müdahale yetkisi bulunmamaktadır.
İLETİŞİM VE DESTEK
İptal, iade, değişim süreçleriyle ilgili her türlü sorunuz için bizimle aşağıdaki kanallar üzerinden hafta içi 09:00 - 18:00 saatleri arasında iletişime geçebilirsiniz:
Firma Adı: Kovan Kırtasiye
E-posta: kovankirtasiye@gmail.com
Telefon: 0538 554 53 34
Adres: Mehmet Akif Mahallesi Zehra Sokak No:19D Selçuklu / Konya`,
    },
    hakkimizda: {
      title: "Hakkımızda",
      text: `Kovan Kırtasiye, hobi tutkunlarını, kırtasiye aşıklarını ve kutu oyunu severleri ortak bir samimiyet ve değer çatısı altında, yani kendi "kovanımızda" buluşturmak amacıyla kuruldu.

Bizim için ticaret, sadece bir ürünün teslim edilmesinden ibaret değildir. Biz, attığımız her adımda manevi değerleri gözeten, dürüstlüğü, hakkı ve karşılıklı güveni en önde tutan insan odaklı bir işletmeyiz. Dijitalleşen ve bağların zayıfladığı modern dünyada; defterlerin kalıcılığına, analoga dokunmanın huzuruna, hobi kitlerinin ve kutu oyunlarının ailemizle, sevdiklerimizle geçirdiğimiz kıymetli anları nasıl bereketlendirdiğine inanıyoruz.

Ürün yelpazemizi seçerken de, siparişlerinizi hazırlarken de tek bir niyetimiz var: Evlerinize, sıcak sohbetlerinize ve üretkenliğinize değer katabilmek. Kovan Kırtasiye ailesi olarak, geleneksel esnaf ahlakını e-ticaretin modern yüzüyle birleştiriyor; her bir siparişi bir paket olarak değil, bir insana dokunma vesilesi olarak görüyoruz. Emeğe, insana ve samimiyete değer veren herkesle bu kovanda buluşmaktan mutluluk duyuyoruz.`,
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
            Defterler, kutu oyunları ve hobi kitleri ile hayatınıza renk katın.
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
            <li>
              <button
                onClick={() => openModal("iade")}
                className="footer-link-btn"
              >
                İptal ve İade Politikası
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>
            &copy; 2026 <span>Kovan Kırtasiye</span>. Tüm Hakları Saklıdır.
          </p>
          <p className="designer-credit">
            <span>nrgl</span> tarafından tasarlandı ve kodlandı
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
