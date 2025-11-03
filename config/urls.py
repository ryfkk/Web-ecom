from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
# ... (import static files Anda) ...

# 1. IMPORT catalog_view BERSAMA VIEW LAINNYA
from blog.views import login_view, payment_view, catalog_view, cart_view

urlpatterns = [
    path('admin/', admin.site.urls),

    # 2. TAMBAHKAN BARIS INI UNTUK HOMEPAGE
    path('', catalog_view, name='home'),  # <-- INI YANG HILANG

    # Ini path yang sudah Anda tambahkan tadi
    path('login/', login_view, name='login'),
    path('payment/', payment_view, name='payment'),
    path('products/', catalog_view, name='products'),
    path('cart/', cart_view, name='cart'),
]
# ... (tanda + static files Anda) ...
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)