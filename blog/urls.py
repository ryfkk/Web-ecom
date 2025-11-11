from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from blog.views import (
    catalog_view, 
    cart_view,
    about_page,
    contact_page,
    login_view, 
    register_view,
    logout_view, 
    password_reset_view,
    password_reset_confirm_view,
    payment_view,
    process_payment,
    order_confirmation,
    payment_notification,
    check_payment_status,
    sync_cart
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    
    # Halaman Utama
    path('', catalog_view, name='home'),
    path('products/', catalog_view, name='products'),
    path('cart/', cart_view, name='cart'),
    path('about/', about_page, name='about_page'),
    path('contact/', contact_page, name='contact_page'),
    
    # Authentication
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'), 
    path('logout/', logout_view, name='logout'),
    
    # Password Reset
    path('password-reset/', password_reset_view, name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/', password_reset_confirm_view, name='password_reset_confirm'),
    
    # Payment & Checkout
    path('payment/', payment_view, name='payment'),
    path('proses-pembayaran/', process_payment, name='process_payment'),
    path('order-confirmation/<str:order_id>/', order_confirmation, name='order_confirmation'),
    path('payment/notification/', payment_notification, name='payment_notification'),
    
    # API
    path('api/sync-cart/', sync_cart, name='sync_cart'),  # ← DIPINDAH KE SINI!
    path('api/check-payment-status/<str:order_id>/', check_payment_status, name='check_payment_status'),
]

# Media files (untuk development)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)