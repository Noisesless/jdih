<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected array $apiKeys = [];
    protected string $baseUrl;
    protected string $defaultGenerationModel;
    protected string $defaultEmbeddingModel;

    public function __construct()
    {
        $this->baseUrl = config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
        $this->defaultGenerationModel = config('services.gemini.generation_model', 'gemini-3.5-flash');
        $this->defaultEmbeddingModel = config('services.gemini.embedding_model', 'gemini-embedding-001');

        $this->loadApiKeys();
    }

    /**
     * Muat dan bersihkan daftar API Key dari konfigurasi (.env).
     * Mendukung pemisahan koma (,) atau baris baru untuk multi-key pool.
     */
    protected function loadApiKeys(): void
    {
        $rawKeys = [];

        // Cek GEMINI_API_KEYS (jamak)
        $multi = config('services.gemini.api_keys');
        if (!empty($multi)) {
            $rawKeys = array_merge($rawKeys, preg_split('/[,\r\n]+/', $multi));
        }

        // Cek GEMINI_API_KEY (tunggal / comma-separated)
        $single = config('services.gemini.api_key');
        if (!empty($single)) {
            $rawKeys = array_merge($rawKeys, preg_split('/[,\r\n]+/', $single));
        }

        $cleaned = array_map('trim', $rawKeys);
        $this->apiKeys = array_values(array_filter(array_unique($cleaned)));
    }

    /**
     * Dapatkan daftar kunci aktif.
     */
    public function getApiKeys(): array
    {
        return $this->apiKeys;
    }

    /**
     * Hitung jumlah kunci yang terdaftar dalam pool failover.
     */
    public function getKeyCount(): int
    {
        return count($this->apiKeys);
    }

    /**
     * Generate jawaban chat dengan failover multi-key & model fallback.
     */
    public function generateContent(string $systemPrompt, string $userMessage, ?string $preferredModel = null): ?string
    {
        if (empty($this->apiKeys)) {
            Log::error('GeminiService: Tidak ada API Key yang dikonfigurasi.');
            return null;
        }

        $model = $preferredModel ?: $this->defaultGenerationModel;
        $modelsToTry = array_unique([$model, 'gemini-3.5-flash', 'gemini-3.5-flash-lite']);

        // Iterasi setiap API Key yang tersedia (Failover Pool)
        foreach ($this->apiKeys as $keyIndex => $apiKey) {
            $maskedKey = substr($apiKey, 0, 8) . '...' . substr($apiKey, -6);

            foreach ($modelsToTry as $currentModel) {
                try {
                    $response = Http::timeout(25)
                        ->post("{$this->baseUrl}/models/{$currentModel}:generateContent?key=" . urlencode($apiKey), [
                            'systemInstruction' => [
                                'parts' => [['text' => $systemPrompt]]
                            ],
                            'contents' => [
                                [
                                    'role' => 'user',
                                    'parts' => [['text' => $userMessage]]
                                ]
                            ],
                            'generationConfig' => [
                                'temperature' => 0.2,
                                'maxOutputTokens' => 3000,
                                'topP' => 0.95,
                            ]
                        ]);

                    if ($response->successful()) {
                        $json = $response->json();
                        $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
                        if (!empty($text)) {
                            return $text;
                        }
                    }

                    $status = $response->status();
                    $body = $response->body();

                    // Tangani Rate Limit (429), Overload (503), atau Kuota Habis (403/400)
                    if (in_array($status, [429, 503, 403, 400])) {
                        Log::warning("GeminiService [Key #{$keyIndex} ({$maskedKey})]: HTTP {$status} pada model {$currentModel}. Mencoba failover...", [
                            'error' => substr($body, 0, 200)
                        ]);
                        // Lanjut ke model berikutnya atau key berikutnya
                        continue;
                    }

                } catch (\Throwable $e) {
                    Log::warning("GeminiService [Key #{$keyIndex} ({$maskedKey})]: Exception {$e->getMessage()}. Failover ke key berikutnya...");
                    break; // Pindah ke key berikutnya jika network error
                }
            }
        }

        Log::error('GeminiService: Seluruh API Key dalam pool gagal merespons.');
        return null;
    }

    /**
     * Generate embedding vektor dengan failover multi-key.
     */
    public function embedContent(string $text, ?string $preferredModel = null): ?array
    {
        if (empty($this->apiKeys)) {
            Log::error('GeminiService: Tidak ada API Key untuk embedding.');
            return null;
        }

        $model = $preferredModel ?: $this->defaultEmbeddingModel;
        $truncatedText = mb_substr($text, 0, 2048);

        foreach ($this->apiKeys as $keyIndex => $apiKey) {
            $maskedKey = substr($apiKey, 0, 8) . '...' . substr($apiKey, -6);

            try {
                $response = Http::timeout(20)
                    ->post("{$this->baseUrl}/models/{$model}:embedContent?key=" . urlencode($apiKey), [
                        'content' => [
                            'parts' => [['text' => $truncatedText]]
                        ]
                    ]);

                if ($response->successful()) {
                    $json = $response->json();
                    if (!empty($json['embedding']['values'])) {
                        return $json['embedding']['values'];
                    }
                }

                $status = $response->status();
                if (in_array($status, [429, 503, 403, 400])) {
                    Log::warning("GeminiService Embedding [Key #{$keyIndex} ({$maskedKey})]: HTTP {$status}. Failover ke key berikutnya...");
                    continue;
                }

            } catch (\Throwable $e) {
                Log::warning("GeminiService Embedding Exception [Key #{$keyIndex}]: {$e->getMessage()}. Failover...");
            }
        }

        return null;
    }
}
