# co-toast

Modüler toast bildirim kütüphanesi. Konum (üst/alt/sol/sağ), ses, fotoğraf, başlık/açıklama destekler.

## jsDelivr ile kullanım

GitHub repo: [codron-co/co-toast](https://github.com/codron-co/co-toast)

**CSS** (sayfa `<head>` veya stil öncesi):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/codron-co/co-toast@main/dist/ks-toast.css">
```

**JS** (body sonu veya bileşenlerden önce):

```html
<script src="https://cdn.jsdelivr.net/gh/codron-co/co-toast@main/dist/ks-toast.js"></script>
```

İsteğe bağlı: Sayfada varsayılan konum için bir container kullanıyorsanız:

```html
<div id="ks-toast-container" class="ks-toast-container" aria-live="polite"></div>
```

## Kullanım

```javascript
// Kısayollar
KsToast.success('Kaydedildi.');
KsToast.error('Bir hata oluştu.');
KsToast.warning('Dikkat!');
KsToast.info('Bilgi mesajı.');

// Genel API
KsToast.show('Mesaj', 'success');
KsToast.show({ message: 'Başlık', title: 'Bilgi', description: 'Açıklama', type: 'info' });
KsToast.show({ message: 'Yeni mesaj', image: '/path/to/avatar.jpg', position: 'top-right' });
KsToast.show({ message: 'Bildirim', sound: '/path/to/notification.mp3', position: 'bottom-right' });
```

**Konumlar:** `top-center` | `top-left` | `top-right` | `bottom-center` | `bottom-left` | `bottom-right`

**Tipler:** `success` | `error` | `danger` | `warning` | `info` | `default`

## Klasör yapısı

```
ks-toast
├─ dist
│   ├─ ks-toast.js
│   └─ ks-toast.css
├─ src
│   ├─ toast.js
│   └─ toast.css
├─ README.md
└─ package.json (opsiyonel)
```

## Lisans

MIT
