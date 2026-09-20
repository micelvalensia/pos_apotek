# Konfigurasi HTTPS untuk Production

## Masalah yang Diperbaiki

Ketika aplikasi diakses melalui HTTPS domain (Cloudflare → Nginx External → Docker Nginx → Laravel), redirect login/logout mengarah ke HTTP alih-alih HTTPS, menyebabkan mixed content error.

## Root Cause

Laravel tidak mendeteksi HTTPS karena:
1. TrustProxies tidak dikonfigurasi dengan benar
2. Nginx eksternal tidak meneruskan `X-Forwarded-Proto: https` header (kirim `http` padahal Cloudflare sudah HTTPS)
3. Cloudflare mengirim info HTTPS lewat `CF-Visitor` header yang tidak dibaca Laravel default
4. Laravel URL generator masih menggunakan scheme HTTP

## Solusi yang Diterapkan

### 1. Fix TrustProxies Configuration (`bootstrap/app.php`)

```php
$middleware->trustProxies(
    at: '*',  // Trust semua proxy (Cloudflare + nginx)
    headers: Request::HEADER_X_FORWARDED_FOR
        | Request::HEADER_X_FORWARDED_HOST
        | Request::HEADER_X_FORWARDED_PORT
        | Request::HEADER_X_FORWARDED_PROTO
        | Request::HEADER_X_FORWARDED_PREFIX
        | Request::HEADER_X_FORWARDED_AWS_ELB  // Support Cloudflare
);
```

### 2. Force HTTPS URL Scheme Middleware (Cloudflare Compatible)

Middleware `ForceHttpsScheme` membaca header `CF-Visitor` dari Cloudflare untuk deteksi HTTPS:

```php
// app/Http/Middleware/ForceHttpsScheme.php
// Check Cloudflare CF-Visitor header
$cfVisitor = $request->header('CF-Visitor');
if ($cfVisitor) {
    $visitor = json_decode($cfVisitor, true);
    $isCloudflareHttps = isset($visitor['scheme']) && $visitor['scheme'] === 'https';
}

// Force HTTPS if CF-Visitor indicates HTTPS OR production
if ($isCloudflareHttps || config('app.env') === 'production') {
    URL::forceScheme('https');
    $request->server->set('HTTPS', 'on');
}
```

### 3. Update Environment Variables untuk Production

Pada file `.env` di server production:

```bash
# CRITICAL - Set ini ke production agar ForceHttpsScheme aktif
APP_ENV=production
APP_DEBUG=false
APP_URL=https://pos.micel.dev  # Harus HTTPS

# Cookie security untuk HTTPS
SESSION_DOMAIN=pos.micel.dev
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

### 4. Konfigurasi Nginx Eksternal (Yang Terima dari Cloudflare)

**PENTING:** Ada 2 opsi, pilih salah satu:

#### Opsi A: Biarkan Cloudflare Handle SSL (Recommended - Lebih Mudah)

Nginx eksternal tidak perlu konfigurasi SSL, cukup forward semua header dari Cloudflare:

```nginx
server {
    listen 80;
    server_name pos.micel.dev;

    location / {
        # Proxy ke Docker nginx
        proxy_pass http://localhost:8000;
        
        # Forward semua headers dari Cloudflare (termasuk CF-Visitor)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header CF-Visitor $http_cf_visitor;  # PENTING untuk Cloudflare
        
        # Optional: bisa force set header ini juga
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Port 443;
    }
}
```

**Catatan:** Dengan opsi ini, middleware `ForceHttpsScheme` akan otomatis detect HTTPS dari `CF-Visitor` header yang dikirim Cloudflare.

#### Opsi B: Nginx Handle SSL Sendiri (Full SSL)

```nginx
server {
    listen 80;
    server_name pos.micel.dev;

    location / {
        # Proxy ke Docker nginx
        proxy_pass http://localhost:8000;  # atau IP:port Docker
        
        # CRITICAL - Forward headers dari Cloudflare
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # INI YANG KRUSIAL untuk HTTPS detection
        proxy_set_header X-Forwarded-Proto https;  # Force https
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 443;     # Force 443
    }
}
```

**Catatan:** Dengan opsi ini, middleware `ForceHttpsScheme` akan otomatis detect HTTPS dari `CF-Visitor` header yang dikirim Cloudflare.

#### Opsi B: Nginx Handle SSL Sendiri (Full SSL)

```nginx
server {
    listen 443 ssl http2;
    server_name pos.micel.dev;
    
    ssl_certificate /path/to/cloudflare-origin-cert.pem;
    ssl_certificate_key /path/to/cloudflare-origin-key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;  # Otomatis https
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header CF-Visitor $http_cf_visitor;
    }
}
```

### 5. Konfigurasi Docker Nginx (Sudah Diperbaiki)

File `docker/nginx/nginx.conf` sudah dikonfigurasi untuk forward headers:

```nginx
location ~ \.php$ {
    fastcgi_pass app:9000;
    fastcgi_index index.php;
    include fastcgi_params;
    
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    
    # Forward headers ke PHP-FPM
    fastcgi_param HTTP_X_FORWARDED_FOR $proxy_add_x_forwarded_for;
    fastcgi_param HTTP_X_FORWARDED_HOST $host;
    fastcgi_param HTTP_X_FORWARDED_PORT $server_port;
    fastcgi_param HTTP_X_FORWARDED_PROTO $scheme;
}
```

## Deployment Steps

1. **Update konfigurasi nginx eksternal** - Tambahkan `proxy_set_header CF-Visitor $http_cf_visitor;`

   Edit file nginx config (biasanya di `/etc/nginx/sites-available/`):
   ```bash
   sudo nano /etc/nginx/sites-available/pos-apotek
   ```
   
   Tambahkan baris ini di dalam block `location /`:
   ```nginx
   proxy_set_header CF-Visitor $http_cf_visitor;
   ```

2. **Update `.env` di server:**
```bash
APP_ENV=production
APP_URL=https://pos.micel.dev
SESSION_DOMAIN=pos.micel.dev
SESSION_SECURE_COOKIE=true
```

3. **Restart semua services:**
```bash
# Test nginx config dulu
sudo nginx -t

# Restart nginx eksternal
sudo systemctl restart nginx

# Restart Docker containers
docker-compose down
docker-compose up -d

# Clear Laravel cache
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan route:clear
```

4. **Test route debug:**
```bash
curl -H "CF-Visitor: {\"scheme\":\"https\"}" https://pos.micel.dev/debug-proxy
# Seharusnya return: "scheme":"https","secure":true
```

## Testing

1. **Test redirect HTTPS:**
```bash
curl -I https://pos.micel.dev/login
# Pastikan location header menggunakan https://
```

2. **Test dari browser:**
   - Login → harus redirect ke `https://pos.micel.dev/admin/dashboard`
   - Logout → harus redirect ke `https://pos.micel.dev/`
   - Check browser console, tidak boleh ada mixed content warning

3. **Verify headers diterima Laravel:**
```bash
# Tambahkan temporary logging di app/Http/Middleware/ForceHttpsScheme.php
\Log::info('Request headers', [
    'X-Forwarded-Proto' => $request->header('X-Forwarded-Proto'),
    'X-Forwarded-Host' => $request->header('X-Forwarded-Host'),
    'X-Forwarded-Port' => $request->header('X-Forwarded-Port'),
    'secure' => $request->secure(),
    'scheme' => $request->getScheme(),
]);
```

## Troubleshooting

### Masih redirect ke HTTP?

1. **Check APP_ENV di `.env`**: Harus `production` agar ForceHttpsScheme aktif
2. **Check nginx eksternal**: Pastikan `proxy_set_header X-Forwarded-Proto https;` ada
3. **Check APP_URL**: Harus dimulai dengan `https://`
4. **Clear cache**: `php artisan config:clear && php artisan cache:clear`

### Mixed content warning?

- Pastikan semua asset (CSS/JS) di-load dari HTTPS
- Check Vite config menggunakan HTTPS untuk asset URL
- Verify cookies menggunakan `Secure` flag: `SESSION_SECURE_COOKIE=true`

### Session/Cookie tidak persist?

- Set `SESSION_DOMAIN` ke domain yang sesuai (tanpa `https://`)
- Set `SESSION_SECURE_COOKIE=true`
- Set `SESSION_SAME_SITE=lax` atau `strict`

### 502 Bad Gateway setelah restart?

- Check Docker containers running: `docker-compose ps`
- Check nginx error log: `docker-compose logs nginx`
- Check PHP-FPM log: `docker-compose logs app`
