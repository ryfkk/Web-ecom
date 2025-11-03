from django.shortcuts import render
# PASTIKAN FUNGSI INI ADA (Mungkin namanya beda, misal home_view)
def catalog_view(request):
    """Menampilkan halaman utama/katalog."""
    return render(request, 'blog/catalog.html')
# TAMBAHKAN FUNGSI INI
def login_view(request):
    """Menampilkan halaman login."""
    # Pastikan path 'blog/login.html' sudah benar
    return render(request, 'blog/login.html')
# TAMBAHKAN FUNGSI INI JUGA
def payment_view(request):
    """Menampilkan halaman checkout/payment."""
    # Pastikan path 'blog/payment.html' sudah benar
    return render(request, 'blog/payment.html')
def cart_view(request):
    """Menampilkan halaman keranjang belanja."""
    return render(request, 'blog/cart.html')