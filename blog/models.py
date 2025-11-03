from django.db import models

# ===============================================
# 1. BUAT MODEL KATEGORI BARU
# ===============================================
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    # Ini untuk menampilkan nama kategori di admin
    def __str__(self):
        return self.name
    
    # Opsi tambahan agar di admin tulisannya "Categories" bukan "Categorys"
    class Meta:
        verbose_name_plural = "Categories"


# ===============================================
# 2. UPDATE MODEL PRODUCT KAMU
# ===============================================
class Product(models.Model):
    # Tambahkan baris ini untuk menghubungkan Product ke Category
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL,  # Jika kategori dihapus, produknya tidak ikut terhapus
        null=True,                  # Boleh kosong di database
        blank=True                  # Boleh kosong di form admin
    )
    
    # Ini bidang-bidang yang sudah kamu punya
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name