<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- PWA Meta Tags -->
        <meta name="theme-color" content="#0d9488">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="JDIH BNA">
        <link rel="icon" type="image/png" href="/favicon.png?v={{ time() }}">
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
        <link rel="manifest" href="/manifest.json">

        <!-- Fonts & Performance -->
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="preload" href="https://fonts.bunny.net/figtree/files/figtree-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="https://fonts.bunny.net/figtree/files/figtree-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
        
        <style>
            @font-face {
                font-family: 'Figtree';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url(https://fonts.bunny.net/figtree/files/figtree-latin-400-normal.woff2) format('woff2');
                unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
            }
            @font-face {
                font-family: 'Figtree';
                font-style: normal;
                font-weight: 500;
                font-display: swap;
                src: url(https://fonts.bunny.net/figtree/files/figtree-latin-500-normal.woff2) format('woff2');
                unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
            }
            @font-face {
                font-family: 'Figtree';
                font-style: normal;
                font-weight: 600;
                font-display: swap;
                src: url(https://fonts.bunny.net/figtree/files/figtree-latin-600-normal.woff2) format('woff2');
                unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
            }
            @font-face {
                font-family: 'Figtree';
                font-style: normal;
                font-weight: 900;
                font-display: swap;
                src: url(https://fonts.bunny.net/figtree/files/figtree-latin-900-normal.woff2) format('woff2');
                unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
            }
        </style>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
        
        <style>
            #nprogress .bar { background: #0d9488 !important; height: 3px !important; }
            #nprogress .spinner-icon { border-top-color: #0d9488 !important; border-left-color: #0d9488 !important; }
            
            /* Modern Loader CSS */
            .loader-container {
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: #ffffff;
                z-index: 9999;
            }
            .loader-logo-wrapper {
                position: relative;
                margin-bottom: 2rem;
            }
            .loader-logo {
                width: 80px;
                height: 80px;
                position: relative;
                z-index: 10;
                animation: pulse-soft 2s infinite ease-in-out;
            }
            .loader-ring {
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                border: 2px solid #f1f5f9;
                border-top-color: #0d9488;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            .loader-text {
                font-family: 'Figtree', sans-serif;
                font-weight: 900;
                font-size: 0.75rem;
                letter-spacing: 0.2em;
                color: #64748b;
                text-transform: uppercase;
                margin-top: 1rem;
                animation: fade-in-out 1.5s infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse-soft { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
            @keyframes fade-in-out { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        </style>
    </head>
    <body class="font-sans antialiased">
        @inertia
        
        <div id="inertia-placeholder" style="display: none;">
            <div class="loader-container">
                <div class="loader-logo-wrapper">
                    <div class="loader-ring"></div>
                    <img src="/loader.png" alt="Loading..." class="loader-logo" />
                </div>
                <div class="loader-text">Memuat Data Hukum...</div>
            </div>
        </div>

        <script>
            // Show placeholder only on first load before Inertia takes over
            if (!document.querySelector('#app').children.length) {
                const placeholder = document.querySelector('#inertia-placeholder');
                const appRoot = document.querySelector('#app');
                if (placeholder && appRoot) {
                    appRoot.innerHTML = placeholder.innerHTML;
                }
            }
        </script>

        <script>
            // Register PWA Service Worker
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function(err) {
                        console.warn('[PWA] Service Worker registration skipped/failed:', err);
                    });
                });
            }
        </script>
    </body>
</html>
