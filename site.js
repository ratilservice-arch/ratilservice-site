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
    fetch('/products.json')
      .then(response => response.json())
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          storeContainer.innerHTML = data.items.map(item => `
            <div class="card">
              <div>
                ${item.image ? `<div style="margin-bottom:15px; border-radius:12px; overflow:hidden; height:180px;"><img src="${item.image}" alt="${item.title}" style="width:100%; height:100%; object-fit:cover;"></div>` : ''}
                <h3>${item.title}</h3>
                ${item.price ? `<p style="color:var(--primary); font-weight:700; margin-bottom:10px;">${item.price}</p>` : ''}
                <p>${item.description || ''}</p>
              </div>
              <a href="#maintenance" class="card-btn">اطلب القطعة الآن</a>
            </div>
          `).join('');
        }
      })
      .catch(error => console.error('Error loading products:', error));
  }
})();
