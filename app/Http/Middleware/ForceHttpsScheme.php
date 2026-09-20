<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;
use Closure;

class ForceHttpsScheme
{
    /**
     * Handle an incoming request.
     *
     * Force HTTPS scheme for URL generation when behind Cloudflare or production.
     * Detects HTTPS from CF-Visitor header or X-Forwarded-Proto.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check Cloudflare CF-Visitor header
        $cfVisitor = $request->header('CF-Visitor');
        $isCloudflareHttps = false;

        if ($cfVisitor) {
            $visitor = json_decode($cfVisitor, true);
            $isCloudflareHttps = isset($visitor['scheme']) && $visitor['scheme'] === 'https';
        }

        // Force HTTPS if:
        // 1. CF-Visitor indicates HTTPS, OR
        // 2. X-Forwarded-Proto is https, OR
        // 3. APP_ENV is production
        if ($isCloudflareHttps ||
                $request->header('X-Forwarded-Proto') === 'https' ||
                config('app.env') === 'production') {
            URL::forceScheme('https');

            // Also trust the proxy by setting the request as secure
            if ($isCloudflareHttps) {
                $request->server->set('HTTPS', 'on');
            }
        }

        return $next($request);
    }
}
