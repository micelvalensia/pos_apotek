# Konfigurasi HTTPS untuk Production

## Masalah yang Diperbaiki

Ketika aplikasi diakses melalui HTTPS domain, redirect login/logout mengarah ke HTTP alih-alih HTTPS. Ini disebabkan oleh:
1. Laravel tidak mempercayai proxy headers dari nginx
2. Environment variables tidak dikonfigurasi untuk HTTPS

## Solusi yang Diterapkan

### 1. Fix TrustProxies Configuration (`bootstrap/app.php`)

Sudah diperbaiki di commit ini - menghapus duplikat `$middleware->` dan double semicolon yang menyebabkan konfigurasi trustProxies gagal:

```php
$middleware->trustProxies(
    at: '*',
    headers: Request::HEADER_X_FORWARDED_FOR
        | Request::HEADER_X_FORWARDED_HOST
        | Request::HEADER_X_FORWARDED_PORT
        | Request::HEADER_X_FORWARDED_PROTO
);
```

### 2. Update Environment Variables untuk Production

Pada file `.env` di server production, update nilai berikut:

```bash
# Ganti dengan domain HTTPS yang sebenarnya
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Untuk memaksa HTTPS di semua route
FORCE_HTTPS=true
```

### 3. Konfigurasi Nginx untuk Proxy Headers

Jika nginx berada di depan aplikasi (sebagai reverse proxy), update `docker/nginx/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/html/public;
    index index.php;

    # Proxy headers untuk TrustProxies
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        
        # Forward proxy headers
        fastcgi_param HTTP_X_FORWARDED_FOR $proxy_add_x_forwarded_for;
        fastcgi_param HTTP_X_FORWARDED_HOST $host;
        fastcgi_param HTTP_X_FORWARDED_PORT $server_port;
        fastcgi_param HTTP_X_FORWARDED_PROTO $scheme;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

**Jika nginx ada di luar Docker (sebagai HTTPS terminator):**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
    }
}
```

### 4. Optional: Force HTTPS Middleware (Jika Diperlukan)

Jika ingin memaksa semua request menggunakan HTTPS, tambahkan di `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware): void {
    // ... konfigurasi existing ...
    
    // Force HTTPS di production
    if (config('app.env') === 'production') {
        $middleware->web(append: [
            \Illuminate\Http\Middleware\ForceHttpsMiddleware::class,
        ]);
    }
})
```

Atau buat custom middleware:

```php
// app/Http/Middleware/ForceHttps.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceHttps
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->secure() && config('app.env') === 'production') {
            return redirect()->secure($request->getRequestUri());
        }

        return $next($request);
    }
}
```

## Testing

Setelah deployment:

1. Clear cache di server:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

2. Test redirect:
   - Login → harus redirect ke HTTPS
   - Logout → harus redirect ke HTTPS
   - Semua internal links harus generate URL dengan HTTPS

3. Check response headers:
```bash
curl -I https://yourdomain.com/dashboard
# Pastikan tidak ada redirect ke HTTP
```

## Troubleshooting

- **Masih redirect ke HTTP**: Pastikan `APP_URL` di `.env` menggunakan `https://`
- **Mixed content warning**: Periksa asset URL di Vite menggunakan HTTPS
- **Session/Cookie issue**: Pastikan `SESSION_SECURE_COOKIE=true` di production
