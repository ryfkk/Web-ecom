from django.urls import path
from . import views  # Mengimpor views dari file views.py

urlpatterns = [
    # ... (URL Anda yang lain mungkin sudah ada di sini, misal untuk catalog)
    # path('', views.catalog_view, name='catalog'), 

    # TAMBAHKAN 2 BARIS INI
    path('login/', views.login_view, name='login'),
    path('payment/', views.payment_view, name='payment'),
     path('cart/', views.cart_view, name='cart'),
    
    # ... (mungkin ada path admin, dll)
]