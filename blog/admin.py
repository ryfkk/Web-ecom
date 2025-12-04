from django.contrib import admin
from django import forms
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import Product, Category, Order, OrderItem, Payment


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'product_count')
    search_fields = ('name',)
    
    @display(description='Jumlah Produk')
    def product_count(self, obj):
        return obj.product_set.count()


# ✅ Custom Form untuk Product (handle image upload)
class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'image': forms.ClearableFileInput(attrs={'accept': 'image/*'}),
        }


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    form = ProductAdminForm  # ✅ Pakai custom form
    list_display = ('name', 'category', 'price_display', 'original_price_display', 'discount_badge', 'image_preview', 'stock', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description')
    list_per_page = 20
    
    fieldsets = (
        ('📦 Informasi Produk', {
            'fields': ('category', 'name', 'description'),
            'description': 'Detail informasi tentang produk'
        }),
        ('💰 Harga & Stok', {
            'fields': ('original_price', 'price', 'stock'),
            'description': 'Atur harga asli, harga diskon, dan stok produk'
        }),
        ('🖼️ Gambar Produk', {
            'fields': ('image',),
            'description': 'Upload gambar produk (JPG, PNG, max 5MB)'
        }),
    )
    
    # Override form field labels
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if 'price' in form.base_fields:
            form.base_fields['price'].label = '💸 Harga Diskon'
            form.base_fields['price'].help_text = 'Harga setelah diskon (harga jual)'
        if 'original_price' in form.base_fields:
            form.base_fields['original_price'].label = '💵 Harga Asli'
            form.base_fields['original_price'].help_text = 'Harga sebelum diskon (opsional, untuk menampilkan diskon)'
        return form
    
    @display(description='Harga Diskon')
    def price_display(self, obj):
        return f'IDR {obj.price:,.0f}'
    
    @display(description='Harga Asli')
    def original_price_display(self, obj):
        if obj.original_price:
            return f'IDR {obj.original_price:,.0f}'
        return '-'
    
    @display(description='Diskon')
    def discount_badge(self, obj):
        discount = obj.get_discount_percentage()
        if discount > 0:
            return f'🏷️ {discount}%'
        return '-'
    
    @display(description='Preview')
    def image_preview(self, obj):
        if obj.image:
            return '✅'
        return '❌'


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ('order_id', 'full_name', 'status_badge', 'total_display', 'payment_method', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('order_id', 'full_name', 'phone', 'address')
    readonly_fields = ('order_id', 'created_at', 'updated_at', 'paid_at')
    list_per_page = 20
    
    fieldsets = (
        ('📋 Informasi Pesanan', {
            'fields': ('order_id', 'user', 'status', 'payment_method')
        }),
        ('👤 Data Penerima', {
            'fields': ('full_name', 'phone', 'address', 'city', 'postal_code'),
        }),
        ('💵 Informasi Pembayaran', {
            'fields': ('total_amount', 'created_at', 'updated_at', 'paid_at'),
        }),
    )
    
    @display(description='Status', ordering='status')
    def status_badge(self, obj):
        colors = {
            'pending': '🟡',
            'paid': '🔵',
            'processing': '🟣',
            'shipped': '🟠',
            'delivered': '🟢',
            'cancelled': '🔴',
        }
        status_names = {
            'pending': 'Pending',
            'paid': 'Dibayar',
            'processing': 'Diproses',
            'shipped': 'Dikirim',
            'delivered': 'Selesai',
            'cancelled': 'Dibatalkan',
        }
        return f"{colors.get(obj.status, '⚪')} {status_names.get(obj.status, obj.status)}"
    
    @display(description='Total', ordering='total_amount')
    def total_display(self, obj):
        return f'IDR {obj.total_amount:,.0f}'


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'subtotal_display')
    can_delete = False
    
    def subtotal_display(self, obj):
        return f'IDR {obj.get_subtotal():,.0f}'
    subtotal_display.short_description = 'Subtotal'


# Add inline to OrderAdmin
OrderAdmin.inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price_display', 'subtotal_display')
    list_filter = ('order__created_at',)
    search_fields = ('order__order_id', 'product__name')
    
    @display(description='Harga')
    def price_display(self, obj):
        return f'IDR {obj.price:,.0f}'
    
    @display(description='Subtotal')
    def subtotal_display(self, obj):
        return f'IDR {obj.get_subtotal():,.0f}'


@admin.register(Payment)
class PaymentAdmin(ModelAdmin):
    list_display = ('order', 'payment_method_display', 'status_badge', 'amount_display', 'created_at')
    list_filter = ('payment_method', 'status', 'created_at')
    search_fields = ('order__order_id', 'transaction_id')
    readonly_fields = ('transaction_id', 'snap_token', 'redirect_url', 'created_at', 'updated_at')
    list_per_page = 20
    
    fieldsets = (
        ('📋 Informasi Pembayaran', {
            'fields': ('order', 'payment_method', 'amount', 'status')
        }),
        ('🔐 Data Midtrans', {
            'fields': ('transaction_id', 'snap_token', 'redirect_url'),
            'description': 'Data dari Midtrans Payment Gateway'
        }),
        ('💳 Detail Pembayaran', {
            'fields': ('bank_choice', 'ewallet_choice', 'virtual_account_number'),
        }),
        ('⏰ Timestamp', {
            'fields': ('created_at', 'updated_at', 'expired_at'),
        }),
    )
    
    @display(description='Metode')
    def payment_method_display(self, obj):
        methods = {
            'credit_card': '💳 Kartu Kredit',
            'qris': '📱 QRIS',
            'bank_transfer': '🏦 Transfer Bank',
            'e_wallet': '📲 E-Wallet',
        }
        return methods.get(obj.payment_method, obj.payment_method)
    
    @display(description='Status', ordering='status')
    def status_badge(self, obj):
        colors = {
            'pending': '🟡',
            'success': '🟢',
            'failed': '🔴',
            'expired': '⚫',
        }
        status_names = {
            'pending': 'Pending',
            'success': 'Berhasil',
            'failed': 'Gagal',
            'expired': 'Kadaluarsa',
        }
        return f"{colors.get(obj.status, '⚪')} {status_names.get(obj.status, obj.status)}"
    
    @display(description='Jumlah', ordering='amount')
    def amount_display(self, obj):
        return f'IDR {obj.amount:,.0f}'