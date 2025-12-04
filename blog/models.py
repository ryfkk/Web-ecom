from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class Category(models.Model):
    """Model untuk kategori produk"""
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"


class Product(models.Model):
    
    """Model untuk produk/barang"""
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def get_discount_percentage(self):
        if self.original_price and self.original_price > self.price:
            discount = ((self.original_price - self.price) / self.original_price) * 100
            return int(discount)
        return 0


class Order(models.Model):
    """Model untuk pesanan"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    order_id = models.CharField(max_length=100, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    
    # Data Pengiriman
    full_name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    phone = models.CharField(max_length=20)
    
    # Data Order
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_id} - {self.full_name}"

    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}-{timezone.now().strftime('%Y%m%d')}"
        super().save(*args, **kwargs)
    
    # 🆕 METHOD BARU - Hitung subtotal produk saja (tanpa ongkir)
    def get_items_total(self):
        """Get total of all items without shipping"""
        from decimal import Decimal
        total = Decimal('0.00')
        for item in self.items.all():
            total += item.get_subtotal()
        return total


class OrderItem(models.Model):
    """Model untuk item dalam pesanan"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name} - Order {self.order.order_id}"

    def get_subtotal(self):
        return self.price * self.quantity


class Payment(models.Model):
    """Model untuk transaksi pembayaran"""
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),  # 🆕 TAMBAHAN - untuk support cancel order
    ]

    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('qris', 'QRIS'),
        ('bank_transfer', 'Bank Transfer'),
        ('e_wallet', 'E-Wallet'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    
    # Data Midtrans
    transaction_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    snap_token = models.CharField(max_length=255, null=True, blank=True)
    redirect_url = models.URLField(null=True, blank=True)
    
    # Data Payment
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Info Tambahan
    bank_choice = models.CharField(max_length=50, null=True, blank=True)
    ewallet_choice = models.CharField(max_length=50, null=True, blank=True)
    virtual_account_number = models.CharField(max_length=50, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expired_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.order.order_id}"