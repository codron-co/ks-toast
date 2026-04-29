# ks-toast

Modüler toast bildirim kütüphanesi. Konum (üst/alt/sol/sağ), ses, fotoğraf, başlık/açıklama destekler. Açık `<dialog>` (modal) üzerinde de doğru katmanda görünür (`ks-toast-dialog-host`).

**GitHub:** [codron-co/ks-toast](https://github.com/codron-co/ks-toast)

### 1.0.1

- **Ortalama:** `top-center` / `bottom-center` için `left: 50%` + `translateX(-50%)` kaldırıldı; `left`/`right` + yatay `margin: auto` (scrollbar / subpixel kayma riski azalır).
- **Hover yığını:** İmleç üzerindeyken yığındaki `transform` / `margin` değişimleri kaldırıldı; titreme ve X üzerinde zıplama gibi geri bildirim döngüleri engellenir. `min-height: 70vh` hover alanı kaldırıldı.
- **perspective:** Yığın konteynerinde `400px` → `none`.
- `--ks-toast-step` kaldırıldı (yalnızca kaldırılan hover kurallarında kullanılıyordu).

## CDN (jsDelivr)

Paket kökü (dosya listesi):

**https://cdn.jsdelivr.net/gh/codron-co/ks-toast/**

Üretim dosyaları (`dist/`; dal adını ihtiyaca göre `master` / `main` ile değiştirin):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/codron-co/ks-toast@master/dist/ks-toast.css">
<script src="https://cdn.jsdelivr.net/gh/codron-co/ks-toast@master/dist/ks-toast.js" defer></script>
```

İsteğe bağlı — varsayılan konum (`top-center`) için sayfada önceden container:

```html
<div id="ks-toast-container" class="ks-toast-container" aria-live="polite"></div>
```

## API

```javascript
// Kısayollar
KsToast.success('Kaydedildi.');
KsToast.error('Bir hata oluştu.');
KsToast.warning('Dikkat!');
KsToast.info('Bilgi mesajı.');

// camelCase alias (aynı nesne)
ksToast.success('Tamam.');

// Genel
KsToast.show('Mesaj', 'success');
KsToast.show({ message: 'Başlık', title: 'Bilgi', description: 'Açıklama', type: 'info' });
KsToast.show({ message: 'Yeni mesaj', image: '/path/to/avatar.jpg', position: 'top-right' });
KsToast.show({ message: 'Bildirim', sound: '/path/to/notification.mp3', position: 'bottom-right' });
```

**Konumlar:** `top-center` | `top-left` | `top-right` | `bottom-center` | `bottom-left` | `bottom-right`

**Tipler:** `success` | `error` | `danger` | `warning` | `info` | `default`

Font Awesome sınıfları varsayılan ikonlar için kullanılır (`fas fa-check-circle` vb.); projede uygun FA sürümünün yüklü olduğundan emin olun.

## Klasör yapısı

```
ks-toast
├─ dist
│   ├─ ks-toast.js
│   └─ ks-toast.css
├─ README.md
└─ package.json
```

## Lisans

MIT
