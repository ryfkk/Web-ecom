from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-your-secret-key-here-change-in-production'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition
INSTALLED_APPS = [
    'unfold',
    'unfold.contrib.filters', 
    'unfold.contrib.forms',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blog.apps.BlogConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Jakarta'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Authentication
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Login/Logout URLs
LOGIN_REDIRECT_URL = '/profile/'
LOGOUT_REDIRECT_URL = '/'
LOGIN_URL = '/login/'

# Messages Framework
from django.contrib.messages import constants as messages
MESSAGE_TAGS = {
    messages.DEBUG: 'debug',
    messages.INFO: 'info',
    messages.SUCCESS: 'success',
    messages.WARNING: 'warning',
    messages.ERROR: 'error',
}

# ========================================
# EMAIL CONFIGURATION - GMAIL SMTP
# ========================================

# Gunakan SMTP Gmail untuk kirim email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# ⚠️ GANTI INI DENGAN EMAIL DAN APP PASSWORD KAMU!
EMAIL_HOST_USER = 'threeofkind1@gmail.com'  # Email Gmail lo
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # App Password (16 digit dari Google)

# Email pengirim default
DEFAULT_FROM_EMAIL = 'Threeofkind.supply <threeofkind1@gmail.com>'

# Admin email (tujuan email dari contact form)
ADMIN_EMAIL = 'threeofkind1@gmail.com'

# Password Reset Timeout
PASSWORD_RESET_TIMEOUT = 86400  # 24 hours

# ========================================
# MIDTRANS PAYMENT GATEWAY CONFIGURATION
# ========================================

# Mode: False = Sandbox (testing), True = Production (live)
MIDTRANS_IS_PRODUCTION = False

# Sandbox Keys - GANTI DENGAN KEY ANDA!
MIDTRANS_SERVER_KEY = 'SB-Mid-server-VPyNxUatIo3DowGxudMoEXdS'
MIDTRANS_CLIENT_KEY = 'SB-Mid-client-wijDPgIztgYcJqCC'

# Production Keys (uncomment dan ganti saat mau go live)
# MIDTRANS_SERVER_KEY = 'Mid-server-YOUR_PRODUCTION_SERVER_KEY'
# MIDTRANS_CLIENT_KEY = 'Mid-client-YOUR_PRODUCTION_CLIENT_KEY'