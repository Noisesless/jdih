<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id', 'user_name', 'user_email',
        'action', 'model_type', 'model_id', 'model_label',
        'description', 'old_values', 'new_values',
        'ip_address', 'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Buat log secara manual dari mana saja.
     */
    public static function log(
        string $action,
        ?Model $model = null,
        ?string $description = null,
        array $oldValues = [],
        array $newValues = []
    ): self {
        $user    = auth()->user();
        $request = request();

        return static::create([
            'user_id'     => $user?->id,
            'user_name'   => $user?->name,
            'user_email'  => $user?->email,
            'action'      => $action,
            'model_type'  => $model ? class_basename($model) : null,
            'model_id'    => $model?->getKey(),
            'model_label' => $model ? static::guessLabel($model) : null,
            'description' => $description,
            'old_values'  => $oldValues ?: null,
            'new_values'  => $newValues ?: null,
            'ip_address'  => $request?->ip(),
            'user_agent'  => $request?->userAgent(),
        ]);
    }

    private static function guessLabel(Model $model): string
    {
        return $model->title
            ?? $model->name
            ?? $model->subject
            ?? ('#' . $model->getKey());
    }

    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            'created'      => 'Dibuat',
            'updated'      => 'Diubah',
            'deleted'      => 'Dihapus',
            'login'        => 'Login',
            'logout'       => 'Logout',
            'failed_login' => 'Gagal Login',
            'viewed'       => 'Dilihat',
            'exported'     => 'Diekspor',
            'printed'      => 'Dicetak',
            default        => ucfirst($this->action),
        };
    }

    public function getActionColorAttribute(): string
    {
        return match ($this->action) {
            'created'      => 'success',
            'updated'      => 'warning',
            'deleted'      => 'danger',
            'login'        => 'info',
            'logout'       => 'gray',
            'failed_login' => 'danger',
            'printed'      => 'primary',
            default        => 'gray',
        };
    }
}
