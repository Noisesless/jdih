<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class RecordVisitor
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Hanya catat request GET sukses dari user (bukan asset, API, atau bot)
        if ($request->isMethod('GET') && $response->getStatusCode() < 400) {
            $this->recordVisit($request);
        }

        return $response;
    }

    /**
     * Catat kunjungan secara non-blocking dan hemat database.
     */
    protected function recordVisit(Request $request): void
    {
        // Abaikan route background, API, aset statis, atau livewire/healthcheck
        if (
            $request->ajax() ||
            $request->is('api/*', 'storage/*', 'build/*', 'images/*', 'favicon.ico', 'robots.txt', 'up')
        ) {
            return;
        }

        $ip = $request->ip();
        if (!$ip) {
            return;
        }

        $userAgent = $request->userAgent() ?? '';
        // Filter out robot/crawler umum
        if (preg_match('/bot|crawl|slurp|spider|mediapartners|lighthouse|headless/i', $userAgent)) {
            return;
        }

        // 1. Catat ke cache untuk indikator pengunjung online (window 5 menit)
        try {
            $ipHash = substr(md5($ip), 0, 16);
            $active = Cache::get('active_online_visitors', []);
            if (!is_array($active)) {
                $active = [];
            }
            $now = time();
            $active[$ipHash] = $now;

            // Bersihkan entri kedaluwarsa (> 5 menit)
            $cutoff = $now - 300;
            foreach ($active as $k => $timestamp) {
                if ($timestamp < $cutoff) {
                    unset($active[$k]);
                }
            }
            Cache::put('active_online_visitors', $active, 600);
        } catch (\Throwable $e) {
            // Abaikan kegagalan cache secara senyap
        }

        // 2. Catat ke tabel visitors
        $today = now()->toDateString();
        $throttleKey = "visited_hit_{$ip}_{$today}";

        // Terapkan throttle 60 detik per IP agar klik bertubi-tubi tidak membebani database
        if (!Cache::has($throttleKey)) {
            try {
                if (Schema::hasTable('visitors')) {
                    DB::table('visitors')->upsert(
                        [
                            'ip_address'   => $ip,
                            'visited_date' => $today,
                            'user_agent'   => substr($userAgent, 0, 500),
                            'hits'         => 1,
                            'created_at'   => now(),
                            'updated_at'   => now(),
                        ],
                        ['ip_address', 'visited_date'],
                        [
                            'hits'         => DB::raw('hits + 1'),
                            'updated_at'   => now(),
                        ]
                    );
                    Cache::put($throttleKey, true, 60);
                }
            } catch (\Throwable $e) {
                // Abaikan jika database sedang migrasi atau sementara tidak merespons
            }
        }
    }
}
