<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VisitorChart extends ChartWidget
{
    protected ?string $heading = 'Statistik Kunjungan Portal';

    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = 1;

    public ?string $filter = '7';

    protected function getFilters(): ?array
    {
        return [
            '7'  => '7 Hari Terakhir',
            '14' => '14 Hari Terakhir',
            '30' => '30 Hari Terakhir',
        ];
    }

    public function getDescription(): ?string
    {
        if (! Schema::hasTable('visitors')) {
            return null;
        }

        $today = now()->toDateString();
        $todayUnique = DB::table('visitors')->where('visited_date', $today)->count();
        $todayHits   = (int) (DB::table('visitors')->where('visited_date', $today)->sum('hits') ?: 0);

        return "Hari ini: {$todayUnique} pengunjung unik ({$todayHits} tayangan)";
    }

    protected function getData(): array
    {
        $activeFilter = (int) ($this->filter ?? 7);
        $days = in_array($activeFilter, [7, 14, 30]) ? $activeFilter : 7;

        $startDate = now()->subDays($days - 1)->startOfDay();
        $endDate   = now()->endOfDay();

        $rawStats = collect();

        if (Schema::hasTable('visitors')) {
            $rawStats = DB::table('visitors')
                ->select(
                    'visited_date',
                    DB::raw('COUNT(*) as unique_visitors'),
                    DB::raw('SUM(hits) as total_hits')
                )
                ->whereBetween('visited_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->groupBy('visited_date')
                ->get()
                ->keyBy('visited_date');
        }

        $labels     = [];
        $uniqueData = [];
        $hitsData   = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date     = now()->subDays($i);
            $dateKey  = $date->toDateString();
            $labels[] = $date->translatedFormat('d M');

            $row          = $rawStats->get($dateKey);
            $uniqueData[] = (int) ($row->unique_visitors ?? 0);
            $hitsData[]   = (int) ($row->total_hits ?? 0);
        }

        return [
            'datasets' => [
                [
                    'label'           => 'Total Tayangan (Hits)',
                    'data'            => $hitsData,
                    'fill'            => 'start',
                    'borderColor'     => '#0284c7', // Sky Blue
                    'backgroundColor' => 'rgba(2, 132, 199, 0.08)',
                    'tension'         => 0.35,
                ],
                [
                    'label'           => 'Pengunjung Unik (IP)',
                    'data'            => $uniqueData,
                    'fill'            => 'start',
                    'borderColor'     => '#0d9488', // JDIH Teal
                    'backgroundColor' => 'rgba(13, 148, 136, 0.15)',
                    'tension'         => 0.35,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}

