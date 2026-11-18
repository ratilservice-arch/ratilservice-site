(() => {
  'use strict';

  // التحكم بالقائمة الجانبية (الجوال)
  const menuButton = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  const setMenuOpen = (isOpen) => {
    if (!menuButton || !primaryNav) return;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل');
    primaryNav.classList.toggle('is-open', isOpen);
    const icon = menuButton.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars', !isOpen);
      icon.classList.toggle('fa-xmark', isOpen);
    }
  };

  if (menuButton && primaryNav) {
    menuButton.addEventListener('click', () => {
      setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    primaryNav.addEventListener('click', (event) => {
      if (event.target.closest('a') && window.matchMedia('(max-width: 768px)').matches) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('header') && window.matchMedia('(max-width: 768px)').matches) {
        setMenuOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menuButton.focus();
      }
    });
  }

  // نموذج طلب الصيانة عبر واتساب
  const maintenanceForm = document.getElementById('maintenanceForm');
  if (maintenanceForm) {
    maintenanceForm.addEventListener('submit', () => {
      const clientName = document.getElementById('clientName').value.trim();
      const deviceType = document.getElementById('deviceType').value;
      const issueDescription = document.getElementById('issueDesc').value.trim();
      const messageField = document.getElementById('whatsappMessage');
      const status = document.getElementById('formStatus');

      messageField.value = [
        'مرحباً RATIL serviceTech، لدي طلب صيانة:',
        `الاسم/الصالون: ${clientName}`,
        `الجهاز: ${deviceType}`,
        `تفاصيل العطل: ${issueDescription}`
      ].join('\n');

      if (status) status.textContent = 'سيتم فتح WhatsApp برسالتك؛ راجعها ثم أرسلها من التطبيق.';
    });
  }

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const isSafeImage = (value) => typeof value === 'string'
    && value.startsWith('/')
    && !value.includes('..')
    && /\.(?:jpe?g|png|webp)$/i.test(value);

  const productImages = (item) => {
    const listed = Array.isArray(item.images) ? item.images : [];
    const images = listed
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(isSafeImage);
    const single = typeof item.image === 'string' ? item.image.trim() : '';
    if (isSafeImage(single) && !images.includes(single)) images.unshift(single);
    return images;
  };

  const orderUrlFor = (title) => `order.html?product=${encodeURIComponent(title || 'منتج من المتجر')}`;

  const productSlug = (title) => title
    .trim()
    .toLowerCase()
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const createGallery = () => {
    const style = document.createElement('style');
    style.textContent = `
      .product-gallery { position: fixed; inset: 0; z-index: 3000; display: none; align-items: center; justify-content: center; padding: 20px; background: rgba(17, 24, 39, 0.82); }
      .product-gallery.is-open { display: flex; }
      .product-gallery-panel { width: min(760px, 100%); max-height: 100%; overflow: auto; background: #fff; border-radius: 16px; padding: 18px; }
      .product-gallery-photo { display: block; width: 100%; max-height: 62vh; object-fit: contain; background: #f9fafb; border-radius: 12px; }
      .product-gallery-nav { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 12px 0; }
      .product-gallery-nav button, .product-gallery-close { border: 0; border-radius: 8px; background: #f3f4f6; color: #1f2937; font-weight: 700; min-height: 44px; padding: 8px 14px; cursor: pointer; }
      .product-gallery-close { float: left; margin-bottom: 8px; }
      .product-gallery-order { display: block; text-align: center; margin-top: 8px; background: #25d366; color: #fff; }
      .product-gallery-order:hover { background: #128c7e; color: #fff; }
    `;
    document.head.append(style);

    const overlay = document.createElement('div');
    overlay.className = 'product-gallery';
    overlay.innerHTML = `
      <div class="product-gallery-panel" role="dialog" aria-modal="true" aria-labelledby="productGalleryTitle">
        <button type="button" class="product-gallery-close">إغلاق</button>
        <img class="product-gallery-photo" alt="">
        <div class="product-gallery-nav">
          <button type="button" data-gallery="next">الصورة التالية</button>
          <span data-gallery="count"></span>
          <button type="button" data-gallery="prev">الصورة السابقة</button>
        </div>
        <h3 id="productGalleryTitle"></h3>
        <p data-gallery="details"></p>
        <a class="card-btn product-gallery-order">اطلب المنتج</a>
      </div>
    `;
    document.body.append(overlay);

    const photo = overlay.querySelector('.product-gallery-photo');
    const title = overlay.querySelector('#productGalleryTitle');
    const details = overlay.querySelector('[data-gallery="details"]');
    const count = overlay.querySelector('[data-gallery="count"]');
    const order = overlay.querySelector('.product-gallery-order');
    const prev = overlay.querySelector('[data-gallery="prev"]');
    const next = overlay.querySelector('[data-gallery="next"]');
    let images = [];
    let index = 0;
    let lastFocus = null;

    const render = () => {
      const current = images[index];
      photo.src = current || '';
      photo.alt = title.textContent;
      count.textContent = images.length > 1 ? `${index + 1} / ${images.length}` : '';
      prev.hidden = images.length < 2;
      next.hidden = images.length < 2;
    };

    const open = (product) => {
      images = product.images;
      index = 0;
      title.textContent = product.title;
      const lines = [product.price, product.details].filter(Boolean);
      details.textContent = lines.join(' — ');
      details.hidden = lines.length === 0;
      order.href = product.orderUrl;
      lastFocus = document.activeElement;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      render();
      overlay.querySelector('.product-gallery-close').focus();
    };

    let afterClose = () => {};

    const close = () => {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      photo.removeAttribute('src');
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
      afterClose();
    };

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelector('.product-gallery-close').addEventListener('click', close);
    prev.addEventListener('click', () => {
      index = (index - 1 + images.length) % images.length;
      render();
    });
    next.addEventListener('click', () => {
      index = (index + 1) % images.length;
      render();
    });
    document.addEventListener('keydown', (event) => {
      if (!overlay.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') next.click();
      if (event.key === 'ArrowRight') prev.click();
    });

    return { open, close, onClose: (callback) => { afterClose = callback; } };
  };

  // جلب وعرض المنتجات وقطع الغيار ديناميكياً في المتجر
  const storeContainer = document.getElementById('store-container');
  if (storeContainer) {
    const gallery = createGallery();
    fetch('products.json?v=20261118-links', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => {
        if (!data || !Array.isArray(data.items) || data.items.length === 0) return;
        const usedSlugs = new Set();
        const products = data.items.map((item) => {
          const title = typeof item.title === 'string' ? item.title.trim() : '';
          let slug = productSlug(title) || 'product';
          if (usedSlugs.has(slug)) {
            let copy = 2;
            while (usedSlugs.has(`${slug}-${copy}`)) copy += 1;
            slug = `${slug}-${copy}`;
          }
          usedSlugs.add(slug);
          return {
            title,
            slug,
            price: typeof item.price === 'string' ? item.price.trim() : '',
            details: typeof item.description === 'string' ? item.description.trim() : '',
            images: productImages(item),
            orderUrl: orderUrlFor(title),
            link: `store.html?item=${encodeURIComponent(slug)}`
          };
        }).filter((product) => product.title && product.images.length);

        const productUrl = (product) => {
          const url = new URL('store.html', location.href);
          url.search = '';
          url.searchParams.set('item', product.slug);
          return `${url.pathname}${url.search}`;
        };

        const openProduct = (product, pushHistory) => {
          gallery.open(product);
          if (!pushHistory) return;
          const next = productUrl(product);
          if (`${location.pathname}${location.search}` !== next) {
            history.pushState({ item: product.slug }, '', next);
          }
        };

        const productFromLocation = () => {
          const slug = new URLSearchParams(location.search).get('item');
          return products.find((product) => product.slug === slug) || null;
        };

        storeContainer.innerHTML = products.map((product) => `
          <div class="card">
            <a class="product-open" href="${escapeHtml(product.link)}" style="display:block; width:100%; padding:0; border:0; background:transparent; text-align:inherit; cursor:pointer; font:inherit; color:inherit; text-decoration:none;">
              <div style="margin-bottom:15px; border-radius:12px; overflow:hidden; height:180px;">
                <img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.title)}" style="width:100%; height:100%; object-fit:contain;">
              </div>
              <h3>${escapeHtml(product.title)}</h3>
              ${product.price ? `<p style="color:var(--primary); font-weight:700; margin-bottom:10px;">${escapeHtml(product.price)}</p>` : ''}
              ${product.details ? `<p>${escapeHtml(product.details)}</p>` : ''}
              <p style="color:#047857; font-weight:700;">اضغط الصورة لعرضها</p>
            </a>
            <a href="${escapeHtml(product.orderUrl)}" class="card-btn">اطلب المنتج</a>
          </div>
        `).join('');

        storeContainer.addEventListener('click', (event) => {
          const opener = event.target.closest('.product-open');
          if (!opener) return;
          event.preventDefault();
          const product = products.find((entry) => entry.link === opener.getAttribute('href'));
          if (product) openProduct(product, true);
        });

        gallery.onClose(() => {
          if (!new URLSearchParams(location.search).has('item')) return;
          const url = new URL('store.html', location.href);
          url.search = '';
          history.pushState({}, '', `${url.pathname}${url.search}`);
        });

        window.addEventListener('popstate', () => {
          const product = productFromLocation();
          if (product) gallery.open(product);
          else gallery.close();
        });

        const requested = productFromLocation();
        if (requested) openProduct(requested, false);
      })
      .catch(error => console.error('Error loading products:', error));
  }
})();
