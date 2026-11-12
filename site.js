(() => {
  'use strict';

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
})();
