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

  // جلب وعرض المنتجات وقطع الغيار ديناميكياً في المتجر
  const storeContainer = document.getElementById('store-container');
  if (storeContainer) {
    fetch('products.json')
      .then(response => response.json())
      .then(data => {
        console.log("Loaded products data:", data); // لفحص البيانات في المتصفح
        const escapeHtml = (value) => String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        if (data && data.items && data.items.length > 0) {
          storeContainer.innerHTML = data.items.map(item => {
            const title = typeof item.title === 'string' ? item.title.trim() : '';
            const price = typeof item.price === 'string' ? item.price.trim() : '';
            const details = typeof item.description === 'string' ? item.description.trim() : '';
            const image = typeof item.image === 'string' ? item.image.trim() : '';
            const safeImage = image.startsWith('/') && !image.includes('..') && /\.(?:jpe?g|png|webp)$/i.test(image)
              ? image
              : '';
            const message = `مرحباً RATIL serviceTech، أود طلب ${title || 'هذا المنتج'}. هل المنتج متوفر؟`;
            const orderUrl = `https://wa.me/213661314631?text=${encodeURIComponent(message)}`;
            return `
            <div class="card">
              <div>
                ${safeImage ? `<div style="margin-bottom:15px; border-radius:12px; overflow:hidden; height:180px;"><img src="${escapeHtml(safeImage)}" alt="${escapeHtml(title)}" style="width:100%; height:100%; object-fit:cover;"></div>` : ''}
                <h3>${escapeHtml(title)}</h3>
                ${price ? `<p style="color:var(--primary); font-weight:700; margin-bottom:10px;">${escapeHtml(price)}</p>` : ''}
                ${details ? `<p>${escapeHtml(details)}</p>` : ''}
              </div>
              <a href="${orderUrl}" class="card-btn" target="_blank" rel="noopener noreferrer">اطلب المنتج</a>
            </div>
          `;
          }).join('');
        }
      })
      .catch(error => console.error('Error loading products:', error));
  }
})();
