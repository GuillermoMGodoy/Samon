document.addEventListener('DOMContentLoaded', () => {

    // --- LISTA DE PRODUCTOS POR CATEGORÍA ---
    // ¡Aquí puedes agregar/modificar tus productos y categorías!
    const productCategories = [
        {
            category: "Hongos",
            products: [
                { id: 101, name: 'Champiñones Blancos 1° Calidad x KG', image: './images/Hongos/Champi 1°.png' },
                { id: 102, name: 'Portobello 1° Calidad x KG', image: './images/Hongos/Porto 1°.png' },
                { id: 103, name: 'Girgolas x KG', image: 'https://images.unsplash.com/photo-1621944832104-d07936a5a9d6?q=80&w=2071&auto=format&fit=crop' },
            ]
        },
        {
            category: "Frutas Congeladas",
            products: [
                { id: 201, name: 'Arándanos IQF x KG', image: 'https://images.unsplash.com/photo-1498843702518-a6152b963174?q=80&w=1963&auto=format&fit=crop' },
                { id: 202, name: 'Frutillas Patagónicas IQF x KG', image: 'https://images.unsplash.com/photo-1588691238356-59275159049a?q=80&w=2034&auto=format&fit=crop' },
                { id: 203, name: 'Mix de Frutos Rojos x KG', image: 'https://images.unsplash.com/photo-1633469006563-3532c589e623?q=80&w=1935&auto=format&fit=crop' }
            ]
        },
        // --- Agrega más categorías aquí ---
        // {
        //     category: "NUEVA CATEGORIA",
        //     products: [
        //         { id: 301, name: 'Nuevo Producto 1', image: 'URL_IMAGEN' },
        //         { id: 302, name: 'Nuevo Producto 2', image: 'URL_IMAGEN' },
        //     ]
        // }
    ];

    // --- CONFIGURACIÓN IMPORTANTE ---
    const WHATSAPP_NUMBER = '91124779640'; // ¡Reemplaza con tu número!

    // --- Selección de Elementos del DOM ---
    const productListContainer = document.getElementById('product-list-container');
    const allProducts = productCategories.flatMap(cat => cat.products);

    // El resto de los selectores son los mismos...
    const cartFab = document.getElementById('cart-fab');
    const cartCounter = document.getElementById('cart-counter');
    const cartModalOverlay = document.getElementById('cart-modal-overlay');
    const closeModalBtn = document.getElementById('cart-modal-close');
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const sendWhatsappBtn = document.getElementById('send-whatsapp-order');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    let cart = [];

    // --- RENDERIZADO DE PRODUCTOS POR CATEGORÍA ---
    function renderProducts() {
        productListContainer.innerHTML = ''; // Limpiar el contenedor principal

        productCategories.forEach(category => {
            // 1. Crear el título de la categoría
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category.category;
            productListContainer.appendChild(categoryTitle);

            // 2. Crear la grilla de productos para esta categoría
            const productGrid = document.createElement('div');
            productGrid.className = 'product-grid';

            // 3. Llenar la grilla con los productos
            category.products.forEach(product => {
                const isProductInCart = cart.some(item => item.id === product.id);
                const buttonText = isProductInCart ? 'Añadido ✔' : 'Añadir al Pedido';
                const buttonClass = isProductInCart ? 'btn added' : 'btn';

                productGrid.innerHTML += `
                    <div class="product-card fade-in">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <button class="${buttonClass}" data-id="${product.id}" ${isProductInCart ? 'disabled' : ''}>
                                ${buttonText}
                            </button>
                        </div>
                    </div>`;
            });

            productListContainer.appendChild(productGrid);
        });

        // Aplicar la animación de aparición a los elementos recién creados
        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    }

    // --- LÓGICA DEL CARRITO (La mayoría sin cambios) ---

    // Añadir producto al hacer clic
    productListContainer.addEventListener('click', e => {
        if (e.target.matches('.btn:not(.added)')) {
            const productId = parseInt(e.target.dataset.id);
            // Buscamos el producto en nuestra lista aplanada 'allProducts'
            const product = allProducts.find(p => p.id === productId);

            if (product && !cart.some(item => item.id === productId)) {
                cart.push({ ...product, quantity: 1 });
                updateCartView();
                // Actualizar solo el botón clickeado
                e.target.textContent = 'Añadido ✔';
                e.target.classList.add('added');
                e.target.disabled = true;
            }
        }
    });

    // Función para actualizar la vista del modal del carrito
    function updateCartView() {
        cartCounter.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            sendWhatsappBtn.style.display = 'none';
        } else {
            emptyCartMessage.style.display = 'none';
            sendWhatsappBtn.style.display = 'block';

            cart.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    </div>`;
                cartItemsList.appendChild(li);
            });
        }
    }

    // Cambiar cantidad en el modal del carrito
    cartItemsList.addEventListener('click', e => {
        if (e.target.matches('.quantity-btn')) {
            const productId = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            const itemInCart = cart.find(item => item.id === productId);

            if (itemInCart) {
                if (action === 'increase') {
                    itemInCart.quantity++;
                } else if (action === 'decrease') {
                    itemInCart.quantity--;
                    if (itemInCart.quantity === 0) {
                        cart = cart.filter(item => item.id !== productId);
                        // Es necesario re-renderizar los productos para que el botón "Añadir" se reactive
                        renderProducts();
                    }
                }
                updateCartView();
            }
        }
    });

    // Enviar pedido por WhatsApp (sin cambios)
    sendWhatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        let message = '¡Hola Sabor a Monte! Quisiera cotizar el siguiente pedido:\n\n';
        cart.forEach(item => {
            message += `- ${item.quantity} x ${item.name}\n`;
        });
        message += '\n¡Muchas gracias!';
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    // Abrir/cerrar modal y menú hamburguesa (sin cambios)
    cartFab.addEventListener('click', () => cartModalOverlay.classList.add('active'));
    closeModalBtn.addEventListener('click', () => cartModalOverlay.classList.remove('active'));
    cartModalOverlay.addEventListener('click', (e) => {
        if (e.target === cartModalOverlay) cartModalOverlay.classList.remove('active');
    });
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

    // --- ANIMACIÓN DE SCROLL (Intersection Observer) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    // --- INICIALIZACIÓN ---
    renderProducts();
    updateCartView();
});