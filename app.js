// Original data must never be modified.
    const originalProducts = [
      { id: 1, name: 'Laptop', category: 'electronics', price: 25000, stock: 4 },
      { id: 2, name: 'Mouse', category: 'electronics', price: 350, stock: 0 },
      { id: 3, name: 'T-Shirt', category: 'clothes', price: 400, stock: 12 },
      { id: 4, name: 'Jacket', category: 'clothes', price: 1800, stock: 2 },
      { id: 5, name: 'Rice 5kg', category: 'food', price: 220, stock: 30 },
      { id: 6, name: 'Coffee', category: 'food', price: 300, stock: 0 },
      { id: 7, name: 'Headphones', category: 'electronics', price: 1500, stock: 7 },
      { id: 8, name: 'Shoes', category: 'clothes', price: 2200, stock: 5 }
    ];

    let products = originalProducts.map(p => ({ ...p }));
    let nextId = 9;
    let currentFilter = 'all';
    let categoryFilter = 'all';
    let sorted = false;

    // One function changes data and redraws the list.
    function updateData(changeFunction) {
      products = changeFunction(products.map(p => ({ ...p })));
      renderProducts();
    }

    // Reusable filter function factories.
    function maxPrice(limit) {
      return product => product.price <= limit;
    }

    function minPrice(limit) {
      return product => product.price >= limit;
    }

    function setFilter(filter) {
      currentFilter = filter;
      renderProducts();
    }

    function changeCategory() {
      categoryFilter = document.getElementById('categoryFilter').value;
      renderProducts();
    }

    function getVisibleProducts() {
      let result = products.filter(product => {
        if (currentFilter === 'stock' && product.stock <= 0) {
          return false;
        }

        if (currentFilter === 'cheap' && !maxPrice(500)(product)) {
          return false;
        }

        if (currentFilter === 'expensive' && !minPrice(2000)(product)) {
          return false;
        }

        if (
          categoryFilter !== 'all' &&
          product.category !== categoryFilter
        ) {
          return false;
        }

        return true;
      });

      // Sort a new array, not the original products array.
      if (sorted) {
        result.sort((a, b) => a.price - b.price || a.id - b.id);
      }

      return result;
    }
///////
    function renderProducts() {
      const list = getVisibleProducts();
      const productList = document.getElementById('productList');

      if (list.length === 0) {
        productList.innerHTML = '<div class="empty">No products</div>';
      } else {
        productList.innerHTML = '';

        list.forEach(product => {
          const item = document.createElement('div');
          item.className = 'product';

          const info = document.createElement('div');
          info.className = 'product-info';

          const name = document.createElement('div');
          name.textContent =
            `${product.id} - ${product.name} - ${product.price} EGP`;
          if (product.stock === 0) {
            name.classList.add('out-of-stock');
          }

          const stock = document.createElement('div');
          stock.textContent = `Stock: ${product.stock}`;
          if (product.stock === 0) {
            stock.classList.add('out-of-stock');
          }

          info.append(name, stock);

          const actions = document.createElement('div');
          actions.className = 'product-actions';

          const plusButton = document.createElement('button');
          plusButton.className = 'plus-btn';
          plusButton.textContent = '+1';
          plusButton.onclick = () => {
            updateData(items =>
              items.map(p =>
                p.id === product.id ? { ...p, stock: p.stock + 1 } : p
              )
            );
          };

          const sellButton = document.createElement('button');
          sellButton.className = 'sell-btn';
          sellButton.textContent = 'Sell';
          sellButton.disabled = product.stock === 0;
          sellButton.onclick = () => {
            updateData(items =>
              items.map(p =>
                p.id === product.id
                  ? { ...p, stock: Math.max(0, p.stock - 1) }
                  : p
              )
            );
          };

          const removeButton = document.createElement('button');
          removeButton.className = 'delete-btn';
          removeButton.textContent = 'Remove';
          removeButton.onclick = () => {
            if (confirm(`Remove ${product.name}?`)) {
              updateData(items =>
                items.filter(p => p.id !== product.id)
              );
            }
          };

          actions.append(plusButton, sellButton, removeButton);
          item.append(info, actions);
          productList.appendChild(item);
        });
      }

      // Summary is calculated from visible products only.
      document.getElementById('count').textContent = list.length;

      const totalValue = list.reduce(
        (sum, p) => sum + p.price * p.stock,
        0
      );

      document.getElementById('totalValue').textContent =
        totalValue.toLocaleString('en-US', {
          maximumFractionDigits: 2
        });

      let status = 'No products';

      if (list.length > 0) {
        status = list.every(p => p.stock > 0)
          ? 'Everything is in stock'
          : 'Some products are out of stock';
      }

      document.getElementById('status').textContent = status;

      if (products.length === 0) {
        document.getElementById('most-expensive').textContent = 'No products';
      } else {
        const mostExpensive = products.reduce((a, b) =>
          b.price > a.price ? b : a
        );

        document.getElementById('most-expensive').textContent =
          `${mostExpensive.name} (${mostExpensive.price} EGP)`;
      }
    }

    function sortProducts() {
      sorted = !sorted;
      renderProducts();
    }

    function discountProducts() {
      updateData(items =>
        items.map(p => ({
          ...p,
          price: Math.max(
            50,
            Math.round((p.price * 0.9 + Number.EPSILON) * 100) / 100
          )
        }))
      );
    }

    function resetProducts() {
      products = originalProducts.map(p => ({ ...p }));
      nextId = 9;
      currentFilter = 'all';
      categoryFilter = 'all';
      sorted = false;

      document.getElementById('categoryFilter').value = 'all';
      document.getElementById('productForm').reset();
      document.getElementById('error').textContent = '';
      document.getElementById('success').textContent = '';

      renderProducts();
    }

   // add form
    document.getElementById('productForm').addEventListener('submit', function(event) {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const category = document.getElementById('category').value;
      const priceText = document.getElementById('price').value.trim();
      const stockText = document.getElementById('stock').value.trim();

      const price = Number(priceText);
      const stock = Number(stockText);
      const errors = [];

      document.getElementById('error').textContent = '';
      document.getElementById('success').textContent = '';

      if (name.length < 3) {
        errors.push('Name is required and must be at least 3 characters.');
      }

      const duplicate = products.find(
        p => p.name.toLowerCase() === name.toLowerCase()
      );

      if (name && duplicate) {
        errors.push(`${name} already exists (id ${duplicate.id}).`);
      }

      if (!['electronics', 'clothes', 'food'].includes(category)) {
        errors.push('Please choose a category.');
      }

      if (priceText === '' || !Number.isFinite(price) || price <= 0) {
        errors.push('Price must be a number greater than 0.');
      }

      if (
        stockText === '' ||
        !Number.isInteger(stock) ||
        stock < 0 ||
        stock > 1000
      ) {
        errors.push('Stock must be a whole number from 0 to 1000.');
      }

      if (errors.length > 0) {
        document.getElementById('error').textContent = errors.join('\n');
        return;
      }

      const newProduct = {
        id: nextId++,
        name,
        category,
        price: Math.round(price * 100) / 100,
        stock
      };

      updateData(items => [...items, newProduct]);

      this.reset();
      document.getElementById('success').textContent =
        'Product added successfully!';

    });

    // Initial display.
    renderProducts();