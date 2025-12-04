from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from blog import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Halaman Utama
    path('', views.catalog_view, name='home'),
    path('products/', views.catalog_view, name='products'),
    path('cart/', views.cart_view, name='cart'),
    path('about/', views.about_page, name='about_page'),
    path('contact/', views.contact_page, name='contact_page'),
    path('wishlist/', views.wishlist_page, name='wishlist_page'),
    
    # Authentication
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'), 
    path('logout/', views.logout_view, name='logout'),
    
    # Password Reset
    path('password-reset/', views.password_reset_view, name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/', views.password_reset_confirm_view, name='password_reset_confirm'),
    
    # Profile Dashboard
    path('profile/', views.profile_dashboard, name='profile_dashboard'),
    path('profile/orders/', views.profile_orders, name='profile_orders'),
    path('profile/settings/', views.profile_settings, name='profile_settings'),
    
    # Payment & Checkout
    path('payment/', views.payment_view, name='payment'),
    path('proses-pembayaran/', views.process_payment, name='process_payment'),
    path('order-confirmation/<str:order_id>/', views.order_confirmation, name='order_confirmation'),
    path('payment/notification/', views.payment_notification, name='payment_notification'),
    
    # API
    path('api/check-payment-status/<str:order_id>/', views.check_payment_status, name='check_payment_status'),
    path('api/cancel-order/<str:order_id>/', views.cancel_order, name='cancel_order'),
]

# Media files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)