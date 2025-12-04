// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("=== DOM Loaded ===");
    
    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
        console.log('✓ Feather icons initialized');
    }
    
    console.log("Loading cart from localStorage...");
    loadCartFromStorage();
    console.log("Cart loaded:", cart); 
    
    // Initialize all functions
    initializeSearch();
    initializeViewToggle();
    initializeFavorites();
    initializeProductCards();
    initializePaymentForm();
    initializeModalTabs();
    
    renderCart();
    renderPaymentSummary(); 
    
    updateCartBadge();
    console.log('=== Initialization complete ===');
});

// Cart functionality with localStorage
let cart = [];

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('threeofkind_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartBadge();
    }
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('threeofkind_cart', JSON.stringify(cart));
    updateCartBadge();
}

// Product data for modal
const productsData = {
    1: {
        name: "Gelang Titanium Steel Anti Karat Klavikula Multi Layers Hias Permata Hitam Unisex adjustable Anti Karat",
        image: "/static/blog/pict/bracelet 1.jpg", 
        price: 35000,
        priceFormatted: "IDR 35.000",
        originalPrice: "IDR 60.000",
        stock: 8,
        description: "Gelang premium berbahan titanium steel anti karat dengan desain klavikula multi layers yang elegan. Dihiasi permata hitam berkualitas tinggi, cocok untuk pria dan wanita. Desain adjustable membuatnya nyaman digunakan sepanjang hari.",
        features: [
            "Bahan Titanium Steel Anti Karat",
            "Desain Multi Layers Elegan", 
            "Hias Permata Hitam Premium",
            "Unisex - Cocok Pria & Wanita",
            "Adjustable/Dapat Disesuaikan",
            "Anti Alergi & Tahan Lama",
            "Water Resistant",
        ]
    },
    2: {
        name: "Gelang Aesthetic Korean Style Unisex Stylish pria wanita titanium style anti karat",
        image: "/static/blog/pict/bracelet 2.jpg", 
        price: 30000,
        priceFormatted: "IDR 30.000",
        originalPrice: null,
        stock: 7,
        description: "Gelang dengan desain aesthetic Korean style yang trendy dan stylish. Dibuat dengan material berkualitas tinggi, cocok untuk gaya kasual maupun formal. Desain unisex yang cocok untuk semua kalangan.",
        features: [
            "Desain Korean Style Trendy",
            "Material Berkualitas Tinggi",
            "Unisex Design",
            "Cocok untuk Semua Acara",
            "Ringan dan Nyaman",
            "Anti Luntur",
        ]
    },
    3: {
        name: "Kalung Titanium Star boy Kalung Liontin Bintang Stainless Steel Anti Karat Terbaru Pria Dan Wanita",
        image: "/static/blog/pict/necklace 1.jpg", 
        price: 45000,
        priceFormatted: "IDR 45.000",
        originalPrice: "IDR 55.000",
        stock: 7,
        description: "Kalung liontin bintang 'Star Boy' yang terbuat dari stainless steel (titanium) berkualitas. Desain trendy anti karat, anti luntur, dan anti alergi, cocok untuk pria dan wanita.",
        features: [
            "Bahan Stainless Steel (Titanium)",
            "Liontin Bintang 'Star Boy'",
            "Anti Karat & Anti Luntur",
            "Hypoallergenic (Anti Alergi)",
            "Desain Unisex",
            "Cocok untuk Pesta & Harian"
        ]
    },
    4: {
        name: "Kalung Titanium Rantai Rolo Liontin Bulan Bintang Anti Karat dan Anti Luntur untuk Pria dan Wanita",
        image: "/static/blog/pict/necklace 2.jpg", 
        price: 40000,
        priceFormatted: "IDR 40.000",
        originalPrice: "IDR 70.000",
        stock: 3,
        description: "Kalung fashion dengan rantai model rolo dan liontin bulan bintang. Terbuat dari titanium steel yang menjamin anti karat dan anti luntur. Desain elegan untuk pria dan wanita.",
        features: [
            "Bahan Titanium Steel",
            "Rantai Model Rolo",
            "Liontin Bulan Bintang",
            "Anti Karat & Anti Luntur",
            "Warna Tahan Lama",
            "Desain Unisex"
        ]
    },
};

// Format currency
function formatCurrency(amount) {
    return 'IDR ' + amount.toLocaleString('id-ID');
}

// Add to cart functionality
function addToCart(productId, quantity = 1) {
    const product = productsData[productId];
    if (!product) return;

    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: Date.now(),
            productId: productId,
            name: product.name,
            price: product.price,
            priceFormatted: product.priceFormatted,
            image: product.image,
            quantity: quantity
        });
    }
    
    saveCartToStorage();
    updateCartBadge();
}

// Remove from cart
function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.id !== cartItemId);
    saveCartToStorage();
    updateCartBadge();
    renderCart();
    showNotification('Produk dihapus dari keranjang');
}

// Update quantity in cart
function updateQuantity(cartItemId, newQuantity) {
    const item = cart.find(item => item.id === cartItemId);
    if (item && newQuantity > 0) {
        item.quantity = newQuantity;
        saveCartToStorage();
        renderCart();
    } else if (item && newQuantity <= 0) {
        removeFromCart(cartItemId);
    }
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart badge
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge, #cart-badge-header');
    badges.forEach(badge => {
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    });
}

// Render cart page
function renderCart() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) return;

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-items">
                <div class="empty-cart">
                    <i data-feather="shopping-cart" style="width: 100px; height: 100px;"></i>
                    <h3>Keranjang Anda Kosong</h3>
                    <p>Sepertinya Anda belum menambahkan produk ke keranjang</p>
                    <button class="btn btn-primary" onclick="window.location.href='/products/'">
                        <i data-feather="arrow-left"></i>
                        Mulai Belanja
                    </button>
                </div>
            </div>
            <aside class="cart-summary">
                <h2>Ringkasan Belanja</h2>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${formatCurrency(0)}</span>
                </div>
            </aside>
        `;
        feather.replace();
        return;
    }

    const cartItemsHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">${formatCurrency(item.price)}</p>
                <div class="quantity-selector">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" readonly>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <p style="font-size: 1.35rem; font-weight: bold; color: #ef4444;">
                    ${formatCurrency(item.price * item.quantity)}
                </p>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i data-feather="trash-2"></i>
                    Hapus
                </button>
            </div>
        </div>
    `).join('');

    const subtotal = getCartTotal();
    const shipping = 10000;
    const total = subtotal + shipping;

    cartContent.innerHTML = `
        <div class="cart-items">
            ${cartItemsHTML}
        </div>
        
        <aside class="cart-summary">
            <h2>Ringkasan Belanja</h2>
            
            <div class="promo-code">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Kode Promo</label>
                <div class="promo-input-group">
                    <input type="text" placeholder="Masukkan kode promo">
                    <button>Terapkan</button>
                </div>
            </div>
            
            <div class="summary-row">
                <span>Subtotal (${cart.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
                <span>Ongkir</span>
                <span>${formatCurrency(shipping)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>${formatCurrency(total)}</span>
            </div>
            
            <button class="btn btn-success" onclick="proceedToCheckout()">
                <i data-feather="credit-card"></i>
                Lanjut ke Pembayaran
            </button>
            
            <div class="continue-shopping">
                <a href="/products/">
                    <i data-feather="arrow-left"></i>
                    Lanjut Belanja
                </a>
            </div>
        </aside>
    `;

    feather.replace();
}

// ========================================
// PROCEED TO CHECKOUT - SIMPLE VERSION (NO SYNC)
// ========================================
function proceedToCheckout() {
    console.log('[CHECKOUT] Starting simple checkout...');
    
    if (cart.length === 0) {
        alert('Keranjang Anda kosong!');
        return;
    }
    
    console.log('[CHECKOUT] Cart:', cart);
    console.log('[CHECKOUT] Redirecting to /payment/...');
    
    // LANGSUNG REDIRECT TANPA SYNC!
    window.location.href = '/payment/';
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 14px 24px;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 3000);
}

// Product card click functionality
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length === 0) return;

    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.favorite-btn')) {
                const productId = this.getAttribute('data-product-id');
                openProductModal(productId);
            }
        });
    });
}

// Open product modal
function openProductModal(productId) {
    const product = productsData[productId];
    if (!product) return;

    document.getElementById('modalImage').src = product.image; 
    document.getElementById('modalImage').alt = product.name;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalCurrentPrice').textContent = product.priceFormatted;

    const originalPriceEl = document.getElementById('modalOriginalPrice');
    if (product.originalPrice) {
        originalPriceEl.textContent = product.originalPrice;
        originalPriceEl.style.display = 'inline';
    } else {
        originalPriceEl.style.display = 'none';
    }

    const stockEl = document.getElementById('modalStock');
    let stockClass = 'in-stock';
    let stockText = `${product.stock} in stock`;
    
    if (product.stock === 0) {
        stockClass = 'out-of-stock';
        stockText = 'Stok habis';
    } else if (product.stock <= 5) {
        stockClass = 'low-stock';
        stockText = `Tinggal ${product.stock} lagi!`;
    }
    
    stockEl.className = `stock-status ${stockClass}`;
    stockEl.textContent = stockText;

    document.getElementById('modalDescription').textContent = product.description;

    const featuresContainer = document.getElementById('modalFeatures');
    featuresContainer.innerHTML = '';
    if(product.features && product.features.length > 0) {
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresContainer.appendChild(li);
        });
    }

    const quantityInput = document.getElementById('quantityInput');
    quantityInput.max = Math.min(product.stock, 10);
    quantityInput.value = 1;

    document.getElementById('productModal').dataset.currentProduct = productId;
    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';

    feather.replace();
}

// Close modal
function closeModal() {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    modal.classList.remove('open');
    document.body.style.overflow = 'auto';
}

// Quantity controls
function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (!input) return;
    const max = parseInt(input.max);
    const current = parseInt(input.value);
    if (current < max) {
        input.value = current + 1;
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (!input) return;
    const current = parseInt(input.value);
    if (current > 1) {
        input.value = current - 1;
    }
}

// Add to cart from modal
function addToCartFromModal() {
    const modal = document.getElementById('productModal');
    const input = document.getElementById('quantityInput');
    if (!modal || !input) return;

    const productId = modal.dataset.currentProduct;
    const quantity = parseInt(input.value);
    const product = productsData[productId];
    
    if (product && quantity > 0 && quantity <= product.stock) {
        addToCart(productId, quantity);
        showNotification(`${quantity}x ${product.name} berhasil ditambahkan ke keranjang!`);
        closeModal();
    }
}

// Buy now from modal
function buyNowFromModal() {
    const modal = document.getElementById('productModal');
    const input = document.getElementById('quantityInput');
    if (!modal || !input) return;

    const productId = modal.dataset.currentProduct;
    const quantity = parseInt(input.value);
    const product = productsData[productId];
    
    if (product && quantity > 0 && quantity <= product.stock) {
        addToCart(productId, quantity);
        showNotification(`Menuju checkout untuk ${quantity}x ${product.name}...`);
        
        setTimeout(() => {
            closeModal();
            proceedToCheckout();
        }, 1000);
    }
}

// Toggle favorite in modal
function toggleFavoriteModal() {
    const btn = document.querySelector('.favorite-modal-btn');
    if (!btn) return;

    if (btn.classList.contains('favorited')) {
        btn.classList.remove('favorited');
        showNotification('Dihapus dari wishlist');
    } else {
        btn.classList.add('favorited');
        showNotification('Ditambahkan ke wishlist');
    }
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const productName = product.querySelector('.product-name').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                product.style.display = 'flex';
            } else {
                product.style.display = 'none';
            }
        });
    });
}

// View toggle
function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    if (viewBtns.length === 0) return;

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const isGridView = this.querySelector('[data-feather="grid"]');
            const productsGrid = document.querySelector('.products-grid');
            if (!productsGrid) return;
            
            if (isGridView) {
                productsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
                document.querySelectorAll('.product-card').forEach(c => c.style.flexDirection = 'column');
            } else {
                productsGrid.style.gridTemplateColumns = '1fr';
                document.querySelectorAll('.product-card').forEach(c => c.style.flexDirection = 'row');
            }
        });
    });
}

// Favorite button functionality
function initializeFavorites() {
    const favBtns = document.querySelectorAll('.favorite-btn');
    if (favBtns.length === 0) return;

    favBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            
            if (this.classList.contains('favorited')) {
                this.classList.remove('favorited');
                this.style.color = '#64748b';
                showNotification('Dihapus dari favorites');
            } else {
                this.classList.add('favorited');
                this.style.color = '#ef4444';
                showNotification('Ditambahkan ke favorites');
            }
        });
    });
}

// Payment form initialization
function initializePaymentForm() {
    const paymentOptions = document.querySelectorAll('input[name="payment_method"]');
    if (paymentOptions.length === 0) return;

    const ccDetails = document.getElementById('creditCardDetails');
    const vaDetails = document.getElementById('bankTransferDetails');
    const ewDetails = document.getElementById('eWalletDetails');
    const qrisDetails = document.getElementById('qrisDetails');

    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if(ccDetails) ccDetails.style.display = 'none';
            if(vaDetails) vaDetails.style.display = 'none';
            if(ewDetails) ewDetails.style.display = 'none';
            if(qrisDetails) qrisDetails.style.display = 'none';

            if (this.value === 'credit_card') {
                if(ccDetails) ccDetails.style.display = 'block';
            } else if (this.value === 'bank_transfer') {
                if(vaDetails) vaDetails.style.display = 'block';
            } else if (this.value === 'e_wallet') {
                if(ewDetails) ewDetails.style.display = 'block';
            } else if (this.value === 'qris') {
                if(qrisDetails) qrisDetails.style.display = 'block';
            }
        });
    });
}

// Simple toggle favorite function
function toggleFavorite(btn) {
    if (btn.classList.contains('favorited')) {
        btn.classList.remove('favorited');
        btn.style.color = '#64748b';
        showNotification('Dihapus dari favorites');
    } else {
        btn.classList.add('favorited');
        btn.style.color = '#ef4444';
        showNotification('Ditambahkan ke favorites');
    }
}

// Render payment summary
function renderPaymentSummary() {
    const itemsContainer = document.getElementById('payment-summary-items');
    const totalContainer = document.getElementById('payment-summary-total');

    if (!itemsContainer || !totalContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = "<p style='text-align: center; color: #64748b;'>Keranjang Anda kosong.</p>";
        totalContainer.innerHTML = `
            <div class="total-row total-row-final">
                <strong>Total Pembayaran</strong>
                <strong>${formatCurrency(0)}</strong>
            </div>
        `;
        const payButton = document.querySelector('button[form="checkout-form"]');
        if(payButton) {
            payButton.disabled = true;
            payButton.style.opacity = '0.5';
            payButton.style.cursor = 'not-allowed';
            payButton.innerHTML = "<i data-feather='alert-circle'></i> Keranjang Kosong";
            feather.replace();
        }
        return;
    }

    const itemsHTML = cart.map(item => `
        <div class="summary-item">
            <img src="${item.image}" alt="${item.name}" class="summary-item-img">
            <div class="summary-item-info">
                <span class="summary-item-name">${item.name}</span>
                <span class="summary-item-qty">Qty: ${item.quantity}</span>
            </div>
            <span class="summary-item-price">${formatCurrency(item.price * item.quantity)}</span>
        </div>
    `).join('');
    
    itemsContainer.innerHTML = itemsHTML;

    const subtotal = getCartTotal();
    const shipping = 10000; 
    const total = subtotal + shipping;

    const totalHTML = `
        <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="total-row">
            <span>Pengiriman</span>
            <span>${formatCurrency(shipping)}</span>
        </div>
        <div class="total-row total-row-final">
            <strong>Total Pembayaran</strong>
            <strong>${formatCurrency(total)}</strong>
        </div>
    `;
    totalContainer.innerHTML = totalHTML;
}

// Initialize modal tabs
function initializeModalTabs() {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    const tabButtons = modal.querySelectorAll('.modal-tab-btn');
    const tabContents = modal.querySelectorAll('.modal-tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const activeContent = modal.querySelector(`#tab-${tabId}`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}