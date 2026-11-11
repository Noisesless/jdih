<?php

namespace App\Models\Concerns;

use App\Models\ActivityLog;

/**
 * Trait ini dipasang ke Model yang ingin dicatat aktivitasnya secara otomatis.
 *
 * Penggunaan:
 *   use App\Models\Concerns\LogsActivity;
 *   class LegalDocument extends Model { use LogsActivity; }
 */
trait LogsActivity
{
    /**
     * Kolom yang diabaikan dari diff (tidak dicatat perubahannya).
     */
    public function getLogExcept(): array
    {
        $defaults = [
            'updated_at',
            'created_at',
            'deleted_at',
            'view_count',
            'download_count',
            'hits',
            'remember_token',
            'password',
        ];

        return array_unique(array_merge($defaults, $this->logExcept ?? []));
    }

    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            ActivityLog::log('created', $model, null, [], $model->getAttributes());
        });

        static::updated(function ($model) {
            $dirty = $model->getDirty();

            // Kolom teknis internal yang mutlak diabaikan dari pencatatan log
            $systemExcept = ['updated_at', 'created_at', 'deleted_at', 'remember_token', 'password'];
            $activeChanges = array_diff_key($dirty, array_flip($systemExcept));
            if (empty($activeChanges)) return;

            // Periksa apakah perubahan ini HANYA counter publik (view_count / download_count / hits)
            $counterKeys = ['view_count', 'download_count', 'hits'];
            $onlyCounters = empty(array_diff_key($activeChanges, array_flip($counterKeys)));

            if ($onlyCounters) {
                // Catat aktivitas pembaca/unduhan tamu publik dengan keterangan yang jelas
                $user = auth()->user()
                    ?? (class_exists(\Filament\Facades\Filament::class) ? \Filament\Facades\Filament::auth()->user() : null);

                $descParts = [];
                if (isset($activeChanges['view_count'])) {
                    $descParts[] = 'view_count: ' . ($model->getOriginal('view_count') ?? 0) . ' → ' . $model->view_count;
                }
                if (isset($activeChanges['download_count'])) {
                    $descParts[] = 'download_count: ' . ($model->getOriginal('download_count') ?? 0) . ' → ' . $model->download_count;
                }
                $description = 'Kunjungan publik (' . implode(', ', $descParts) . ')';

                ActivityLog::create([
                    'user_id'     => $user?->id,
                    'user_name'   => $user?->name ?? 'Pengunjung (Tamu)',
                    'user_email'  => $user?->email ?? 'guest@jdih.public',
                    'action'      => 'updated',
                    'model_type'  => class_basename($model),
                    'model_id'    => $model->getKey(),
                    'model_label' => $model->title ?? $model->name ?? "ID #{$model->getKey()}",
                    'description' => $description,
                    'old_values'  => array_intersect_key($model->getOriginal(), $activeChanges),
                    'new_values'  => $activeChanges,
                    'ip_address'  => \App\Providers\AppServiceProvider::getClientIp() ?? request()?->ip(),
                    'user_agent'  => request()?->userAgent(),
                ]);
                return;
            }

            // Perubahan data administratif oleh Admin (abaikan counter dari diff agar bersih)
            $contentChanges = array_diff_key($activeChanges, array_flip($counterKeys));
            if (empty($contentChanges)) return;

            $old = array_intersect_key($model->getOriginal(), $contentChanges);
            ActivityLog::log('updated', $model, 'Perubahan data oleh admin', $old, $contentChanges);
        });

        static::deleted(function ($model) {
            ActivityLog::log('deleted', $model,
                'Record dihapus: ' . (
                    $model->title ?? $model->name ?? "ID #{$model->getKey()}"
                )
            );
        });
    }
}
