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
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log('✓ Cart loaded from localStorage:', cart);
        } catch (e) {
            console.error('Error parsing cart:', e);
            cart = [];
        }
    } else {
        console.log('No cart found in localStorage');
        cart = [];
    }
    updateCartBadge();
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('✓ Cart saved to localStorage:', cart);
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
    console.log(`[ADD TO CART] Product ID: ${productId}, Quantity: ${quantity}`);
    
    const product = productsData[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    const existingItem = cart.find(item => item.productId == productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        console.log(`✓ Updated quantity for ${product.name}: ${existingItem.quantity}`);
    } else {
        const newItem = {
            id: Date.now(),
            productId: parseInt(productId),
            name: product.name,
            price: product.price,
            priceFormatted: product.priceFormatted,
            image: product.image,
            quantity: quantity
        };
        cart.push(newItem);
        console.log(`✓ Added new item:`, newItem);
    }
    
    saveCartToStorage();
    updateCartBadge();
    
    console.log('[ADD TO CART] Current cart:', cart);
}

// Remove from cart - IMPROVED NOTIFICATION
function removeFromCart(cartItemId) {
    console.log(`[REMOVE] Removing item ID: ${cartItemId}`);
    
    const item = cart.find(item => item.id === cartItemId);
    if (!item) return;
    
    // Create custom modal confirmation
    const confirmModal = document.createElement('div');
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    confirmModal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        ">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #fee2e2, #fecaca);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                ">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </div>
                <h3 style="
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 0.5rem;
                ">Hapus Produk?</h3>
                <p style="
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin: 0;
                ">${item.name}</p>
            </div>
            
            <div style="display: flex; gap: 0.75rem;">
                <button onclick="closeDeleteModal()" style="
                    flex: 1;
                    padding: 0.875rem 1.5rem;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #64748b;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                ">Batal</button>
                
                <button onclick="confirmRemoveItem(${cartItemId})" style="
                    flex: 1;
                    padding: 0.875rem 1.5rem;
                    border: none;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                ">Hapus</button>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        </style>
    `;
    
    confirmModal.id = 'deleteModal';
    document.body.appendChild(confirmModal);
}

// Close delete modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) modal.remove();
}

// Confirm remove item
function confirmRemoveItem(cartItemId) {
    closeDeleteModal();
    
    const item = cart.find(item => item.id === cartItemId);
    const itemName = item ? item.name : 'Produk';
    
    cart = cart.filter(item => item.id !== cartItemId);
    saveCartToStorage();
    updateCartBadge();
    renderCart();
    
    showSuccessNotification(`${itemName} telah dihapus dari keranjang`);
}

// Show success notification
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        color: #1e293b;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-weight: 500;
        border-left: 4px solid #10b981;
    `;
    
    notification.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
    `;
    
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

// Update quantity in cart
function updateQuantity(cartItemId, newQuantity) {
    console.log(`[UPDATE QTY] Item ID: ${cartItemId}, New Qty: ${newQuantity}`);
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
    console.log(`[BADGE] Total items: ${totalItems}`);
    
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
    if (!cartContent) {
        console.log('[RENDER CART] cart-content element not found');
        return;
    }

    console.log('[RENDER CART] Rendering cart with', cart.length, 'items');

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-items">
                <div class="empty-cart">
                    <div class="empty-cart-icon">
                        <i data-feather="shopping-cart"></i>
                    </div>
                    <h3>Keranjang Anda Kosong</h3>
                    <p>Sepertinya Anda belum menambahkan produk ke keranjang</p>
                    <a href="/products/" class="btn btn-primary">
                        <i data-feather="arrow-left"></i>
                        Mulai Belanja
                    </a>
                </div>
            </div>
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
            </div>
            <div class="cart-item-actions">
                <div class="quantity-selector">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" readonly>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
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
        <div class="cart-content">
            <div class="cart-items">
                ${cartItemsHTML}
            </div>
            
            <aside class="cart-summary">
                <h2>Ringkasan Belanja</h2>
                
                <div class="promo-code">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Kode Promo</label>
                    <div class="promo-input-group">
                        <input type="text" placeholder="Masukkan kode promo" id="promo-input">
                        <button onclick="applyPromo()">Terapkan</button>
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
        </div>
    `;

    feather.replace();
}

// Apply promo code
function applyPromo() {
    const promoInput = document.getElementById('promo-input');
    if (!promoInput) return;
    
    const code = promoInput.value.trim().toUpperCase();
    
    if (code === 'DISKON10') {
        showNotification('Kode promo berhasil! Diskon 10%');
    } else if (code === '') {
        showNotification('Masukkan kode promo');
    } else {
        showNotification('Kode promo tidak valid');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    console.log('[CHECKOUT] Starting checkout...');
    
    if (cart.length === 0) {
        alert('Keranjang Anda kosong!');
        return;
    }
    
    console.log('[CHECKOUT] Cart:', cart);
    console.log('[CHECKOUT] Redirecting to /payment/...');
    
    window.location.href = '/payment/';
}

// Initialize payment form
function initializePaymentForm() {
    const paymentOptions = document.querySelectorAll('input[name="payment_method"]');
    const paymentForm = document.getElementById('checkout-form');
    
    if (paymentOptions.length > 0) {
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
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            console.log('[PAYMENT FORM] Form submitted');
            
            if (cart.length === 0) {
                alert('Keranjang Anda kosong! Silakan tambahkan produk terlebih dahulu.');
                window.location.href = '/products/';
                return false;
            }
            
            const cartData = {};
            cart.forEach(item => {
                cartData[item.productId] = {
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                };
            });
            
            console.log('[PAYMENT FORM] Cart data:', cartData);
            
            let cartInput = this.querySelector('input[name="cart_data"]');
            
            if (!cartInput) {
                cartInput = document.createElement('input');
                cartInput.type = 'hidden';
                cartInput.name = 'cart_data';
                this.appendChild(cartInput);
                console.log('[PAYMENT FORM] Created hidden input for cart_data');
            }
            
            cartInput.value = JSON.stringify(cartData);
            
            console.log('[PAYMENT FORM] Cart JSON:', cartInput.value);
            console.log('[PAYMENT FORM] Submitting form to backend...');
            
            this.submit();
        });
    }
}

// Show notification
function showNotification(message) {
    console.log('[NOTIFICATION]', message);
    
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
    console.log('[MODAL] Opening modal for product:', productId);
    
    const product = productsData[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

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
    if (stockEl) {
        stockEl.style.display = 'none';
    }

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
    quantityInput.max = 9999;
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
    const current = parseInt(input.value);
    input.value = current + 1;
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
    console.log('[MODAL] Add to cart button clicked');
    
    const modal = document.getElementById('productModal');
    const input = document.getElementById('quantityInput');
    if (!modal || !input) {
        console.error('Modal or input not found');
        return;
    }

    const productId = modal.dataset.currentProduct;
    const quantity = parseInt(input.value);
    const product = productsData[productId];
    
    console.log(`[MODAL] Product ID: ${productId}, Quantity: ${quantity}`);
    
    if (product && quantity > 0) {
        addToCart(productId, quantity);
        showNotification(`${quantity}x ${product.name} ditambahkan ke keranjang!`);
        closeModal();
    } else {
        console.error('Invalid product or quantity');
    }
}

// Buy now from modal
function buyNowFromModal() {
    console.log('[MODAL] Buy now button clicked');
    
    const modal = document.getElementById('productModal');
    const input = document.getElementById('quantityInput');
    if (!modal || !input) return;

    const productId = modal.dataset.currentProduct;
    const quantity = parseInt(input.value);
    const product = productsData[productId];
    
    if (product && quantity > 0) {
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
// ═══════════════════════════════════════════════════════════
// WISHLIST MANAGEMENT
// ═══════════════════════════════════════════════════════════

function toggleFavorite(button) {
    const productCard = button.closest('.product-card');
    const productId = parseInt(productCard.getAttribute('data-product-id'));
    
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        button.classList.remove('favorited');
        showWishlistNotification('Removed from wishlist');
    } else {
        // Add to wishlist
        const productName = productCard.querySelector('.product-name').textContent;
        const productImage = productCard.querySelector('.product-image img').src;
        const currentPrice = productCard.querySelector('.current-price').textContent.replace('IDR ', '').replace(/\./g, '').trim();
        const originalPriceElement = productCard.querySelector('.original-price');
        const originalPrice = originalPriceElement ? originalPriceElement.textContent.replace('IDR ', '').replace(/\./g, '').trim() : null;
        
        wishlist.push({
            id: productId,
            name: productName,
            price: parseInt(currentPrice),
            originalPrice: originalPrice ? parseInt(originalPrice) : null,
            image: productImage
        });
        
        button.classList.add('favorited');
        showWishlistNotification('✓ Added to wishlist!');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
}

function updateWishlistBadge() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const badge = document.getElementById('wishlist-badge-header');
    
    if (badge) {
        badge.textContent = wishlist.length;
        badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

function showWishlistNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Load wishlist state on page load
document.addEventListener('DOMContentLoaded', function() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    // Mark favorited products
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = parseInt(card.getAttribute('data-product-id'));
        const isFavorited = wishlist.some(item => item.id === productId);
        
        if (isFavorited) {
            const favoriteBtn = card.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.classList.add('favorited');
            }
        }
    });
    
    updateWishlistBadge();
});