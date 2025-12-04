from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
import midtransclient
import json
from decimal import Decimal
from .models import Order, OrderItem, Payment, Product


# ========================================
# VIEWS HALAMAN UTAMA
# ========================================

def catalog_view(request):
    return render(request, 'blog/catalog.html')


def cart_view(request):
    return render(request, 'blog/cart.html')


def about_page(request):
    return render(request, 'blog/about.html')


def contact_page(request):
    """Contact page with form handling"""
    context = {}
    
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        # Success message
        context['success'] = f'Terima kasih {name}! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda di {email}.'
        context['message_sent'] = True
    
    return render(request, 'blog/contact.html', context)


def wishlist_page(request):
    """Wishlist page"""
    return render(request, 'blog/wishlist.html')


# ========================================
# VIEWS AUTHENTICATION
# ========================================

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
        
    if request.method == 'POST':
        username_or_email = request.POST.get('username')
        password_input = request.POST.get('password')
        
        user = authenticate(request, username=username_or_email, password=password_input)
        
        if user is None and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(request, username=user_obj.username, password=password_input)
            except User.DoesNotExist:
                user = None
        
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            context = {'error': 'Username/Email atau password Anda salah.'}
            return render(request, 'blog/login.html', context)
    
    return render(request, 'blog/login.html')


def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        username_input = request.POST.get('username')
        email_input = request.POST.get('email')
        password_input = request.POST.get('password')
        password2_input = request.POST.get('password2')

        if password_input != password2_input:
            context = {'error': 'Password konfirmasi tidak cocok.'}
            return render(request, 'blog/register.html', context)
        
        if User.objects.filter(username=username_input).exists():
            context = {'error': 'Username ini sudah dipakai.'}
            return render(request, 'blog/register.html', context)
        
        if User.objects.filter(email=email_input).exists():
            context = {'error': 'Email ini sudah dipakai.'}
            return render(request, 'blog/register.html', context)
            
        user = User.objects.create_user(
            username=username_input, 
            email=email_input, 
            password=password_input
        )
        user.save()
        
        login(request, user)
        return redirect('home')

    return render(request, 'blog/register.html')


def logout_view(request):
    logout(request)
    return redirect('home')


# ========================================
# VIEWS PASSWORD RESET
# ========================================

def password_reset_view(request):
    context = {}
    
    if request.method == 'POST':
        email = request.POST.get('email')
        
        try:
            user = User.objects.get(email=email)
            
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            reset_link = request.build_absolute_uri(
                reverse('password_reset_confirm', kwargs={'uidb64': uid, 'token': token})
            )
            
            subject = 'Reset Password - Threeofkind.supply'
            message = f'''
Halo {user.username},

Anda menerima email ini karena ada permintaan untuk reset password akun Anda di Threeofkind.supply.

Klik link berikut untuk membuat password baru:
{reset_link}

Link ini akan kadaluarsa dalam 24 jam.

Jika Anda tidak meminta reset password, abaikan email ini.

Salam,
Tim Threeofkind.supply
            '''
            
            try:
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)
                context['success'] = 'Link reset password telah dikirim ke email Anda.'
            except Exception as e:
                context['error'] = 'Gagal mengirim email.'
            
        except User.DoesNotExist:
            context['success'] = 'Jika email terdaftar, link reset password telah dikirim.'
    
    return render(request, 'blog/password_reset.html', context)


def password_reset_confirm_view(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    context = {}
    
    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            new_password1 = request.POST.get('new_password1')
            new_password2 = request.POST.get('new_password2')
            
            if new_password1 != new_password2:
                context['error'] = 'Password tidak cocok!'
                return render(request, 'blog/password_reset_confirm.html', context)
            
            if len(new_password1) < 8:
                context['error'] = 'Password minimal 8 karakter!'
                return render(request, 'blog/password_reset_confirm.html', context)
            
            user.set_password(new_password1)
            user.save()
            
            return redirect('login')
        
        return render(request, 'blog/password_reset_confirm.html', context)
    else:
        context['error'] = 'Link reset password tidak valid atau sudah kadaluarsa.'
        return render(request, 'blog/password_reset.html', context)


# ========================================
# VIEWS PROFILE DASHBOARD
# ========================================

@login_required
def profile_dashboard(request):
    """Dashboard profil user"""
    status_filter = request.GET.get('status', 'all')
    
    if status_filter == 'all':
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
    else:
        orders = Order.objects.filter(user=request.user, status=status_filter).order_by('-created_at')
    
    total_orders = Order.objects.filter(user=request.user).count()
    completed_orders = Order.objects.filter(user=request.user, status='delivered').count()
    pending_orders = Order.objects.filter(user=request.user, status__in=['pending', 'paid', 'processing']).count()
    
    context = {
        'orders': orders,
        'status_filter': status_filter,
        'total_orders': total_orders,
        'completed_orders': completed_orders,
        'pending_orders': pending_orders,
    }
    
    return render(request, 'blog/profile_dashboard.html', context)


@login_required
def profile_orders(request):
    """Halaman daftar semua pesanan user"""
    status_filter = request.GET.get('status', 'all')
    
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    
    if status_filter != 'all':
        orders = orders.filter(status=status_filter)
    
    context = {
        'orders': orders,
        'status_filter': status_filter,
    }
    
    return render(request, 'blog/profile_orders.html', context)


@login_required
def profile_settings(request):
    """Halaman pengaturan profil user"""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        
        if username != request.user.username:
            if User.objects.filter(username=username).exists():
                context = {'error': 'Username sudah digunakan'}
                return render(request, 'blog/profile_settings.html', context)
        
        if email != request.user.email:
            if User.objects.filter(email=email).exists():
                context = {'error': 'Email sudah digunakan'}
                return render(request, 'blog/profile_settings.html', context)
        
        request.user.username = username
        request.user.email = email
        request.user.first_name = first_name
        request.user.last_name = last_name
        request.user.save()
        
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        
        if new_password:
            if new_password != confirm_password:
                context = {'error': 'Password konfirmasi tidak cocok'}
                return render(request, 'blog/profile_settings.html', context)
            
            if len(new_password) < 8:
                context = {'error': 'Password minimal 8 karakter'}
                return render(request, 'blog/profile_settings.html', context)
            
            request.user.set_password(new_password)
            request.user.save()
            from django.contrib.auth import update_session_auth_hash
            update_session_auth_hash(request, request.user)
        
        context = {'success': 'Profil berhasil diupdate'}
        return render(request, 'blog/profile_settings.html', context)
    
    return render(request, 'blog/profile_settings.html')


# ========================================
# VIEWS PAYMENT
# ========================================

def payment_view(request):
    """Halaman payment/checkout"""
    context = {
        'cart_items': [],
        'total': 0,
        'shipping': 10000,
        'grand_total': 10000
    }
    
    print(f"[PAYMENT VIEW] Rendering payment page")
    
    return render(request, 'blog/payment.html', context)


def process_payment(request):
    """Process payment - FIXED VERSION"""
    if request.method != 'POST':
        return redirect('/')
    
    print("[PROCESS PAYMENT] Starting...")
    print(f"[PROCESS PAYMENT] POST data: {request.POST}")
    
    # Data customer
    full_name = request.POST.get('full_name')
    address = request.POST.get('address')
    city = request.POST.get('city')
    postal_code = request.POST.get('postal_code')
    phone = request.POST.get('phone')
    payment_method = request.POST.get('payment_method')
    
    # Cart data dari form
    cart_json = request.POST.get('cart_data', '{}')
    print(f"[PROCESS PAYMENT] Cart JSON: {cart_json}")
    
    if not all([full_name, address, city, postal_code, phone, payment_method]):
        print("[PROCESS PAYMENT] ERROR: Data tidak lengkap!")
        return JsonResponse({'error': 'Data tidak lengkap'}, status=400)
    
    try:
        cart_data = json.loads(cart_json)
        print(f"[PROCESS PAYMENT] Cart data parsed: {cart_data}")
    except json.JSONDecodeError as e:
        print(f"[PROCESS PAYMENT] ERROR: Invalid JSON - {e}")
        return JsonResponse({'error': 'Invalid cart data'}, status=400)
    
    if not cart_data:
        print("[PROCESS PAYMENT] ERROR: Cart kosong!")
        return JsonResponse({'error': 'Cart kosong'}, status=400)
    
    # Process cart items
    total = Decimal('0.00')
    order_items_data = []
    
    for product_id, item_data in cart_data.items():
        try:
            product = Product.objects.get(id=product_id)
            quantity = item_data.get('quantity', 1)
            
            if product.stock < quantity:
                return JsonResponse({'error': f'Stok {product.name} tidak mencukupi'}, status=400)
            
            price = Decimal(str(item_data.get('price', product.price)))
            subtotal = price * quantity
            total += subtotal
            
            order_items_data.append({
                'product': product,
                'quantity': quantity,
                'price': price
            })
        except Product.DoesNotExist:
            print(f"[PROCESS PAYMENT] Product {product_id} not found")
            continue
    
    if not order_items_data:
        return JsonResponse({'error': 'Tidak ada produk valid dalam cart'}, status=400)
    
    # Add shipping
    shipping_cost = Decimal('10000')
    total_with_shipping = total + shipping_cost
    
    # Create order
    order = Order.objects.create(
        user=request.user if request.user.is_authenticated else None,
        full_name=full_name,
        address=address,
        city=city,
        postal_code=postal_code,
        phone=phone,
        total_amount=total_with_shipping,
        payment_method=payment_method,
        status='pending'
    )
    
    print(f"[PROCESS PAYMENT] Order created: {order.order_id}")
    
    # Create order items
    for item_data in order_items_data:
        OrderItem.objects.create(
            order=order,
            product=item_data['product'],
            quantity=item_data['quantity'],
            price=item_data['price']
        )
        
        product = item_data['product']
        product.stock -= item_data['quantity']
        product.save()
    
    # Midtrans integration
    snap = midtransclient.Snap(
        is_production=settings.MIDTRANS_IS_PRODUCTION,
        server_key=settings.MIDTRANS_SERVER_KEY,
        client_key=settings.MIDTRANS_CLIENT_KEY
    )
    
    transaction_details = {
        'order_id': order.order_id,
        'gross_amount': int(total_with_shipping)
    }
    
    item_details = []
    for item in order.items.all():
        product_name = item.product.name[:50] if len(item.product.name) > 50 else item.product.name
        
        item_details.append({
            'id': str(item.product.id),
            'price': int(item.price),
            'quantity': item.quantity,
            'name': product_name
        })
    
    item_details.append({
        'id': 'SHIPPING',
        'price': int(shipping_cost),
        'quantity': 1,
        'name': 'Biaya Pengiriman'
    })
    
    if request.user.is_authenticated and request.user.email:
        customer_email = request.user.email
    else:
        customer_email = 'customer@threeofkind.supply'
    
    customer_details = {
        'first_name': full_name,
        'email': customer_email,
        'phone': phone,
        'billing_address': {
            'address': address,
            'city': city,
            'postal_code': postal_code,
            'country_code': 'IDN'
        },
        'shipping_address': {
            'address': address,
            'city': city,
            'postal_code': postal_code,
            'country_code': 'IDN'
        }
    }
    
    enabled_payments = []
    if payment_method == 'credit_card':
        enabled_payments = ['credit_card']
    elif payment_method == 'qris':
        enabled_payments = ['qris']
    elif payment_method == 'bank_transfer':
        bank_choice = request.POST.get('bank_choice', 'bca')
        enabled_payments = [f'{bank_choice}_va']
    elif payment_method == 'e_wallet':
        ewallet_choice = request.POST.get('ewallet_choice', 'gopay')
        enabled_payments = [ewallet_choice]
    
    param = {
        'transaction_details': transaction_details,
        'item_details': item_details,
        'customer_details': customer_details,
        'enabled_payments': enabled_payments
    }
    
    print(f"[PROCESS PAYMENT] Midtrans param: {json.dumps(param, indent=2)}")
    
    try:
        print("[PROCESS PAYMENT] Creating Midtrans transaction...")
        transaction = snap.create_transaction(param)
        print(f"[PROCESS PAYMENT] SUCCESS! Token: {transaction.get('token')}")
        
        payment = Payment.objects.create(
            order=order,
            payment_method=payment_method,
            transaction_id=order.order_id,
            snap_token=transaction['token'],
            redirect_url=transaction.get('redirect_url', ''),
            amount=total_with_shipping,
            status='pending',
            bank_choice=request.POST.get('bank_choice') if payment_method == 'bank_transfer' else None,
            ewallet_choice=request.POST.get('ewallet_choice') if payment_method == 'e_wallet' else None
        )
        
        print(f"[PROCESS PAYMENT] Redirecting to confirmation...")
        return redirect('order_confirmation', order_id=order.order_id)
            
    except Exception as e:
        print(f"[PROCESS PAYMENT] ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()
        
        order.delete()
        return JsonResponse({'error': f'Gagal membuat transaksi: {str(e)}'}, status=500)


def order_confirmation(request, order_id):
    order = get_object_or_404(Order, order_id=order_id)
    payment = get_object_or_404(Payment, order=order)
    
    snap_token = request.GET.get('snap_token', payment.snap_token)
    
    context = {
        'order': order,
        'payment': payment,
        'snap_token': snap_token,
        'midtrans_client_key': settings.MIDTRANS_CLIENT_KEY,
        'is_production': settings.MIDTRANS_IS_PRODUCTION,
    }
    
    return render(request, 'blog/order_confirmation.html', context)


@csrf_exempt
def payment_notification(request):
    if request.method != 'POST':
        return HttpResponse(status=405)
    
    try:
        notification = json.loads(request.body)
        
        order_id = notification.get('order_id')
        transaction_status = notification.get('transaction_status')
        fraud_status = notification.get('fraud_status')
        
        payment = Payment.objects.get(transaction_id=order_id)
        order = payment.order
        
        if transaction_status == 'capture':
            if fraud_status == 'accept':
                payment.status = 'success'
                order.status = 'paid'
                order.paid_at = timezone.now()
        elif transaction_status == 'settlement':
            payment.status = 'success'
            order.status = 'paid'
            order.paid_at = timezone.now()
        elif transaction_status in ['cancel', 'deny', 'expire']:
            payment.status = 'failed'
            order.status = 'cancelled'
            
            for item in order.items.all():
                product = item.product
                product.stock += item.quantity
                product.save()
        elif transaction_status == 'pending':
            payment.status = 'pending'
            order.status = 'pending'
        
        payment.save()
        order.save()
        
        return JsonResponse({'status': 'success'})
        
    except Payment.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Payment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


def check_payment_status(request, order_id):
    try:
        order = Order.objects.get(order_id=order_id)
        payment = Payment.objects.get(order=order)
        
        return JsonResponse({
            'status': payment.status,
            'order_status': order.status,
            'paid_at': order.paid_at.isoformat() if order.paid_at else None
        })
    except (Order.DoesNotExist, Payment.DoesNotExist):
        return JsonResponse({'error': 'Order not found'}, status=404)


@login_required
def cancel_order(request, order_id):
    """Cancel order - only for pending orders"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        order = Order.objects.get(order_id=order_id)
        
        if request.user.is_authenticated and order.user != request.user:
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        
        if order.status != 'pending':
            return JsonResponse({'error': 'Hanya pesanan pending yang bisa dibatalkan'}, status=400)
        
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()
        
        order.status = 'cancelled'
        order.save()
        
        try:
            payment = Payment.objects.get(order=order)
            payment.status = 'cancelled'
            payment.save()
        except Payment.DoesNotExist:
            pass
        
        return JsonResponse({
            'success': True,
            'message': 'Pesanan berhasil dibatalkan'
        })
        
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)