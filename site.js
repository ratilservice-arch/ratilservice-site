// جلب وعرض المنتجات في صفحة المتجر ديناميكياً
  const storeContainer = document.getElementById('store-container');
  if (storeContainer) {
    fetch('/products.json')
      .then(response => response.json())
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          storeContainer.innerHTML = data.items.map(item => `
            <div class="product-card" style="background:#fff; padding:15px; margin-bottom:20px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
              <img src="${item.image}" alt="${item.title}" style="width:100%; height:200px; object-fit:cover; border-radius:6px;">
              <h3 style="margin:10px 0 5px; color:#333;">${item.title}</h3>
              <p style="color:#007BFF; font-weight:bold; margin-bottom:5px;">${item.price || ''}</p>
              <p style="color:#666; font-size:14px;">${item.description || ''}</p>
            </div>
          `).join('');
        }
      })
      .catch(error => console.error('Error loading products:', error));
  }
