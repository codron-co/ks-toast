/**
 * KS Toast – modüler toast. Konum (üst/alt/sol/sağ), ses, fotoğraf, başlık/açıklama destekler.
 *
 * Kullanım:
 *   KsToast.show('Mesaj', 'success');
 *   KsToast.show({ message: 'Başlık', title: 'Bilgi', description: 'Açıklama metni', type: 'info' });
 *   KsToast.show({ message: 'Yeni mesaj', image: '/path/to/avatar.jpg', position: 'top-right' });
 *   KsToast.show({ message: 'Bildirim', sound: '/path/to/notification.mp3', position: 'bottom-right' });
 *   position: 'top-center'|'top-left'|'top-right'|'bottom-center'|'bottom-left'|'bottom-right'
 */
(function (global) {
    'use strict';

    var POSITIONS = ['top-center', 'top-left', 'top-right', 'bottom-center', 'bottom-left', 'bottom-right'];
    var DEFAULT_POSITION = 'top-center';
    var DEFAULT_DURATION = 2800;
    var HOVER_LEAVE_DELAY = 2200;

    var TYPE_ICONS = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        danger: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        default: 'fas fa-bell'
    };

    /** icon: true iken Font Awesome yokken de görünsün diye Unicode / sistem fontu. */
    var TYPE_GLYPHS = {
        success: '\u2714',
        error: '\u2716',
        danger: '\u2716',
        warning: '\u26A0',
        info: '\u2139',
        default: '\u2022'
    };

    var VALID_TYPES = ['success', 'error', 'danger', 'warning', 'info', 'default'];
    var DIALOG_HOST_CLASS = 'ks-toast-dialog-host';

    function getOpenModalHost() {
        var modal = document.querySelector('dialog:modal');
        if (!modal) return null;
        var host = modal.getElementsByClassName(DIALOG_HOST_CLASS)[0];
        if (!host) {
            host = document.createElement('div');
            host.className = DIALOG_HOST_CLASS;
            host.setAttribute('aria-hidden', 'true');
            modal.appendChild(host);
        }
        return host;
    }

    /** Açık showModal() dialog yoksa body; varsa top layer içinde host (tüm mevcut z-index’i aşar). */
    function getToastHostParent() {
        return getOpenModalHost() || document.body;
    }

    function reparentToastsFromDialog(dialogEl) {
        if (!dialogEl || dialogEl.tagName !== 'DIALOG') return;
        var host = dialogEl.getElementsByClassName(DIALOG_HOST_CLASS)[0];
        if (!host) return;
        var wraps = host.querySelectorAll('.ks-toast-wrapper');
        for (var i = 0; i < wraps.length; i++) {
            document.body.appendChild(wraps[i]);
        }
        if (host.parentNode) {
            host.parentNode.removeChild(host);
        }
    }

    if (!global.__ksToastDialogReparent) {
        global.__ksToastDialogReparent = true;
        document.addEventListener('close', function (e) {
            if (e.target && e.target.tagName === 'DIALOG') {
                reparentToastsFromDialog(e.target);
            }
        }, true);
    }

    function getWrapper(position) {
        position = POSITIONS.indexOf(position) !== -1 ? position : DEFAULT_POSITION;
        var id = 'ks-toast-wrapper-' + position;
        var wrapper = document.getElementById(id);
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.id = id;
            wrapper.className = 'ks-toast-wrapper ks-toast-wrapper--' + position;
            document.body.appendChild(wrapper);
        }
        var containerId = 'ks-toast-container-' + position;
        var container = document.getElementById(containerId) || (position === DEFAULT_POSITION ? document.getElementById('ks-toast-container') : null);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'ks-toast-container';
            container.setAttribute('aria-live', 'polite');
            wrapper.appendChild(container);
        } else {
            if (container.id !== containerId) container.id = containerId;
            if (container.parentNode !== wrapper) wrapper.appendChild(container);
        }
        if (!wrapper.hasAttribute('data-ks-toast-bound')) {
            wrapper.setAttribute('data-ks-toast-bound', '1');
            wrapper.addEventListener('mouseenter', function () {
                if (wrapper._leaveTimer) {
                    clearTimeout(wrapper._leaveTimer);
                    wrapper._leaveTimer = null;
                }
                var toasts = wrapper.querySelectorAll('.ks-toast');
                for (var i = 0; i < toasts.length; i++) {
                    if (toasts[i]._timer) clearTimeout(toasts[i]._timer);
                    toasts[i]._timer = null;
                }
            });
            wrapper.addEventListener('mouseleave', function () {
                var toasts = [].slice.call(wrapper.querySelectorAll('.ks-toast'));
                wrapper._leaveTimer = setTimeout(function () {
                    wrapper._leaveTimer = null;
                    for (var i = 0; i < toasts.length; i++) {
                        if (toasts[i]._timer) clearTimeout(toasts[i]._timer);
                        hideToast(toasts[i]);
                    }
                }, HOVER_LEAVE_DELAY);
            });
        }
        var toastHost = getToastHostParent();
        if (wrapper.parentNode !== toastHost) {
            toastHost.appendChild(wrapper);
        }
        return wrapper;
    }

    function getContainer(position) {
        getWrapper(position);
        var p = POSITIONS.indexOf(position) !== -1 ? position : DEFAULT_POSITION;
        return document.getElementById('ks-toast-container-' + p);
    }

    function hideToast(el) {
        if (el && el.parentNode) {
            el.style.opacity = '0';
            el.style.transform = 'scale(0.8)';
            setTimeout(function () {
                if (el.parentNode) {
                    var container = el.parentNode;
                    el.parentNode.removeChild(el);
                    var wrapper = container.closest && container.closest('.ks-toast-wrapper');
                    if (wrapper && container.querySelectorAll('.ks-toast').length === 0) {
                        wrapper.classList.remove('has-toasts');
                    }
                }
            }, 200);
        }
    }

    function normalizeArgs(message, typeOrOptions) {
        var options;
        if (typeof typeOrOptions === 'string') {
            options = { message: message, type: typeOrOptions };
        } else if (typeOrOptions && typeof typeOrOptions === 'object') {
            options = { message: message || typeOrOptions.message, type: typeOrOptions.type || 'default' };
            if (typeOrOptions.icon !== undefined) options.icon = typeOrOptions.icon;
            if (typeOrOptions.title !== undefined) options.title = typeOrOptions.title;
            if (typeOrOptions.description !== undefined) options.description = typeOrOptions.description;
            if (typeOrOptions.image !== undefined) options.image = typeOrOptions.image;
            if (typeOrOptions.link !== undefined) options.link = typeOrOptions.link;
            if (typeOrOptions.button !== undefined) options.button = typeOrOptions.button;
            if (typeOrOptions.sound !== undefined) options.sound = typeOrOptions.sound;
            if (typeOrOptions.position !== undefined) options.position = typeOrOptions.position;
            if (typeOrOptions.duration !== undefined) options.duration = typeOrOptions.duration;
        } else {
            options = { message: message, type: 'default' };
        }
        options.type = VALID_TYPES.indexOf(options.type) !== -1 ? options.type : 'default';
        if (options.type === 'danger') options.type = 'error';
        options.duration = options.duration === undefined ? DEFAULT_DURATION : options.duration;
        options.position = POSITIONS.indexOf(options.position) !== -1 ? options.position : DEFAULT_POSITION;
        return options;
    }

    function buildToast(options) {
        var toast = document.createElement('div');
        toast.className = 'ks-toast ks-toast--' + options.type;
        toast.setAttribute('role', 'alert');

        var hasIcon = options.icon === true || (typeof options.icon === 'string' && options.icon);
        var iconClass = options.icon === true ? TYPE_ICONS[options.type] : (options.icon || '');
        var hasTitle = typeof options.title === 'string' && options.title;
        var hasDescription = typeof options.description === 'string' && options.description;
        var hasImage = typeof options.image === 'string' && options.image;
        var hasLink = options.link && typeof options.link === 'object' && options.link.href != null;
        var hasButton = options.button && typeof options.button === 'object' && options.button.text;
        var useInner = hasIcon || hasTitle || hasDescription || hasImage || hasLink || hasButton;

        if (useInner) {
            var inner = document.createElement('div');
            inner.className = 'ks-toast__inner';
            if (hasImage) {
                var img = document.createElement('img');
                img.className = 'ks-toast__img';
                img.src = options.image;
                img.alt = '';
                inner.appendChild(img);
                toast.classList.add('ks-toast--has-img');
            }
            if (hasIcon) {
                var iconEl = document.createElement('span');
                iconEl.className = 'ks-toast__icon';
                iconEl.setAttribute('aria-hidden', 'true');
                if (options.icon === true) {
                    var g = document.createElement('span');
                    g.className = 'ks-toast__glyph ks-toast__glyph--' + options.type;
                    g.textContent = TYPE_GLYPHS[options.type] || TYPE_GLYPHS.default;
                    iconEl.appendChild(g);
                } else {
                    var i = document.createElement('i');
                    i.className = iconClass;
                    iconEl.appendChild(i);
                }
                inner.appendChild(iconEl);
                toast.classList.add('ks-toast--has-icon');
            }
            var content = document.createElement('div');
            content.className = 'ks-toast__content';
            if (hasTitle) {
                var titleEl = document.createElement('div');
                titleEl.className = 'ks-toast__title';
                titleEl.textContent = options.title;
                content.appendChild(titleEl);
            }
            var msgEl = document.createElement('div');
            msgEl.className = 'ks-toast__message';
            msgEl.textContent = options.message || '';
            content.appendChild(msgEl);
            if (hasDescription) {
                var descEl = document.createElement('div');
                descEl.className = 'ks-toast__description';
                descEl.textContent = options.description;
                content.appendChild(descEl);
            }
            if (hasLink || hasButton) {
                var actions = document.createElement('div');
                actions.className = 'ks-toast__actions';
                if (hasLink) {
                    var a = document.createElement('a');
                    a.className = 'ks-toast__link';
                    a.href = options.link.href;
                    a.textContent = options.link.text || 'Git';
                    if (options.link.target) a.target = options.link.target;
                    actions.appendChild(a);
                }
                if (hasButton) {
                    var btn = document.createElement(options.button.href ? 'a' : 'button');
                    btn.className = 'ks-toast__btn';
                    btn.textContent = options.button.text;
                    if (options.button.href) {
                        btn.href = options.button.href;
                        if (options.button.target) btn.target = options.button.target;
                    } else if (typeof options.button.onClick === 'function') {
                        btn.type = 'button';
                        btn.addEventListener('click', function (e) {
                            e.preventDefault();
                            options.button.onClick(toast);
                        });
                    }
                    actions.appendChild(btn);
                }
                content.appendChild(actions);
            }
            inner.appendChild(content);
            toast.appendChild(inner);
        } else {
            var text = document.createElement('span');
            text.className = 'ks-toast__message';
            text.textContent = options.message || '';
            toast.appendChild(text);
        }

        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'ks-toast-close';
        closeBtn.setAttribute('aria-label', 'Kapat');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function () {
            clearTimeout(toast._timer);
            hideToast(toast);
        });
        toast.appendChild(closeBtn);

        return toast;
    }

    /**
     * @param {string|object} message - Gösterilecek metin; veya tek argüman olarak options objesi { message, type, icon, title, link, button, duration }
     * @param {string|object} [typeOrOptions] - 'success'|'error'|'danger'|'warning'|'info'|'default' veya options objesi
     * @param {number} [duration] - ms (sadece show(message, type, duration) kullanımında)
     */
    function show(message, typeOrOptions, duration) {
        var options;
        if (message && typeof message === 'object' && message.message !== undefined) {
            options = normalizeArgs(message.message, message);
        } else if (typeof typeOrOptions === 'object' && typeOrOptions !== null && typeOrOptions.message !== undefined) {
            options = normalizeArgs(typeOrOptions.message, typeOrOptions);
        } else {
            options = normalizeArgs(message, typeOrOptions);
        }
        if (typeof duration === 'number') options.duration = duration;

        var position = options.position || DEFAULT_POSITION;
        var container = getContainer(position);
        var toast = buildToast(options);
        container.appendChild(toast);
        var wrapper = document.getElementById('ks-toast-wrapper-' + position);
        if (wrapper) wrapper.classList.add('has-toasts');

        if (options.sound && typeof options.sound === 'string') {
            try {
                var audio = new Audio(options.sound);
                audio.volume = 0.5;
                audio.play().catch(function () {});
            } catch (e) {}
        }

        if (options.duration > 0) {
            toast._timer = setTimeout(function () {
                hideToast(toast);
            }, options.duration);
        }

        return toast;
    }

    /**
     * window.alert → KsToast (toast senkron değildir; gerçek alert için ksNativeAlert kullanın).
     * @param {object} [options]
     * @param {'tr'|'en'} [options.locale='tr'] — metne göre success/error/warning tahmini
     * @param {function(string): 'success'|'error'|'warning'|'info'} [options.classify] — locale yerine özel sınıflandırma
     */
    function installAlertBridge(options) {
        options = options || {};
        if (global.__ksToastAlertBridged) {
            return;
        }
        global.__ksToastAlertBridged = true;

        var nativeAlert = global.alert.bind(global);
        global.ksNativeAlert = nativeAlert;

        var locale = options.locale || 'tr';
        var customClassify = typeof options.classify === 'function' ? options.classify : null;

        function classifyLocale(text) {
            var lower = text.toLowerCase();
            if (locale === 'en') {
                var errEn =
                    /error|failed|failure|invalid|denied|blocked|cancelled|canceled|not found|access denied|required|missing|wrong|unable|could not|cannot|can't|no connection/i.test(
                        text
                    );
                var okEn =
                    /saved|success|completed|created|deleted|updated|copied|added|sent|downloaded|approved|thank you|done|finished/i.test(lower);
                if (errEn && !okEn) return 'error';
                if (okEn && !errEn) return 'success';
                if (/^\s*warning\b/i.test(text) || /\bcaution\b|\battention\b|\bcareful\b/i.test(lower)) return 'warning';
                return 'info';
            }
            var looksError =
                /hata|başarısız|engellendi|olmadı|silinemedi|yüklenemedi|bağlantı|geçersiz|uyarı|dikkat|iptal|reddedildi|bulunamadı|erişim yok|zorunlu|eksik|yanlış/i.test(
                    text
                );
            var looksSuccess =
                /kaydedildi|başarıyla|tamamlandı|oluşturuldu|silindi|güncellendi|kopyalandı|eklendi|gönderildi|indirildi|onaylandı|teşekkür/i.test(
                    lower
                );
            if (looksError && !looksSuccess) return 'error';
            if (looksSuccess && !looksError) return 'success';
            if (/^\s*uyarı\b/i.test(text) || lower.indexOf('dikkat') !== -1) return 'warning';
            return 'info';
        }

        function routeAlertToToast(message) {
            if (!global.KsToast || message == null) {
                return false;
            }
            var text = String(message);
            var opts = { duration: Math.min(5200, 900 + text.length * 32) };
            if (text === '') {
                global.KsToast.info('', opts);
                return true;
            }
            var kind = customClassify ? customClassify(text) : classifyLocale(text);
            if (kind === 'error') global.KsToast.error(text, opts);
            else if (kind === 'success') global.KsToast.success(text, opts);
            else if (kind === 'warning') global.KsToast.warning(text, opts);
            else global.KsToast.info(text, opts);
            return true;
        }

        global.alert = function (message) {
            if (routeAlertToToast(message)) {
                return;
            }
            nativeAlert(message);
        };
    }

    global.KsToast = {
        show: show,
        /** Kısayollar */
        success: function (msg, opts) { return show(msg, Object.assign({ type: 'success' }, opts)); },
        error: function (msg, opts) { return show(msg, Object.assign({ type: 'error' }, opts)); },
        danger: function (msg, opts) { return show(msg, Object.assign({ type: 'danger' }, opts)); },
        warning: function (msg, opts) { return show(msg, Object.assign({ type: 'warning' }, opts)); },
        info: function (msg, opts) { return show(msg, Object.assign({ type: 'info' }, opts)); },
        default: function (msg, opts) { return show(msg, Object.assign({ type: 'default' }, opts)); },
        installAlertBridge: installAlertBridge
    };
    /** camelCase alias (projeler arası uyumluluk) */
    global.ksToast = global.KsToast;

    try {
        var cs = typeof document !== 'undefined' ? document.currentScript : null;
        if (cs && cs.hasAttribute && cs.hasAttribute('data-alert-bridge')) {
            var bridgeLocale = cs.getAttribute('data-alert-bridge');
            installAlertBridge({
                locale: bridgeLocale && bridgeLocale.trim() ? bridgeLocale.trim() : 'tr'
            });
        }
    } catch (eBridge) {}
})(typeof window !== 'undefined' ? window : this);
