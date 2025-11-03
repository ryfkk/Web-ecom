from django.contrib import admin
# 1. Import Category di sini
from .models import Product, Category

# 2. Buat Admin class untuk Category (opsional tapi bagus)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

# 3. Update ProductAdmin kamu
class ProductAdmin(admin.ModelAdmin):
    # Tambahkan 'category' di sini
    list_display = ('name', 'category', 'price') 
    search_fields = ('name', 'description')
    
    # Tambahkan 'category' sebagai filter
    list_filter = ('category', 'price',) 
    
    list_editable = ('price',)
    
    # ... (fieldsets kamu yang lain) ...


# 4. Daftarkan model baru kamu
admin.site.register(Category, CategoryAdmin)

# Ini pendaftaran Product kamu yang sudah ada (pastikan pakai ProductAdmin)
admin.site.register(Product, ProductAdmin)