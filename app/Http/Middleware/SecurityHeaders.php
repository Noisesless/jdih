<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $host = $request->getHost();
        $isLocalHost = in_array($host, ['127.0.0.1', 'localhost', '::1'])
            || str_ends_with($host, '.test')
            || str_ends_with($host, '.local')
            || app()->isLocal()
            || file_exists(public_path('hot'));

        // Content Security Policy (CSP)
        if ($isLocalHost) {
            // Lingkungan lokal/dev: izinkan Vite dev server & WebSocket HMR
            $csp = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; ";
            $csp .= "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://127.0.0.1:5173 http://localhost:5173 https://www.googletagmanager.com https://cdn.jsdelivr.net https://cdn.ayroui.com https://www.youtube.com https://s.ytimg.com; ";
            $csp .= "style-src 'self' 'unsafe-inline' http://127.0.0.1:5173 http://localhost:5173 https://fonts.googleapis.com https://fonts.bunny.net https://cdn.jsdelivr.net https://cdn.ayroui.com; ";
            $csp .= "font-src 'self' data: http://127.0.0.1:5173 http://localhost:5173 https://fonts.gstatic.com https://fonts.bunny.net https://cdn.jsdelivr.net https://cdn.ayroui.com; ";
            $csp .= "img-src 'self' data: blob: http://127.0.0.1:5173 http://localhost:5173 https://jdih.banjarnegarakab.go.id https://www.googletagmanager.com https://i.ytimg.com https://maps.gstatic.com https://maps.googleapis.com; ";
            $csp .= "connect-src 'self' http://127.0.0.1:5173 ws://127.0.0.1:5173 http://localhost:5173 ws://localhost:5173 https://www.google-analytics.com; ";
            $csp .= "frame-src 'self' https://www.youtube.com https://vt.tiktok.com https://www.google.com https://maps.google.com; ";

            $response->headers->set('Content-Security-Policy', $csp);
        } else {
            // Kebijakan CSP ketat untuk produksi
            $csp = "default-src 'self'; ";
            $csp .= "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.jsdelivr.net https://cdn.ayroui.com https://www.youtube.com https://s.ytimg.com; ";
            $csp .= "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.bunny.net https://cdn.jsdelivr.net https://cdn.ayroui.com; ";
            $csp .= "font-src 'self' data: https://fonts.gstatic.com https://fonts.bunny.net https://cdn.jsdelivr.net https://cdn.ayroui.com; ";
            $csp .= "img-src 'self' data: blob: https://jdih.banjarnegarakab.go.id https://www.googletagmanager.com https://i.ytimg.com https://maps.gstatic.com https://maps.googleapis.com; "; 
            $csp .= "connect-src 'self' https://www.google-analytics.com; "; 
            $csp .= "frame-src 'self' https://www.youtube.com https://vt.tiktok.com https://www.google.com https://maps.google.com; "; 

            $response->headers->set('Content-Security-Policy', $csp);
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), payment=(), geolocation=(self), fullscreen=(self)');
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}
