<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add 14-field Permenkumham No. 8 Tahun 2019 metadata columns to legal_decisions
     * non-destructively (all new columns nullable or with safe defaults).
     */
    public function up(): void
    {
        Schema::table('legal_decisions', function (Blueprint $table) {
            if (!Schema::hasColumn('legal_decisions', 'document_type')) {
                $table->string('document_type')->default('Putusan')->after('id');
            }
            if (!Schema::hasColumn('legal_decisions', 'teu')) {
                $table->string('teu')->nullable()->after('title');
            }
            if (!Schema::hasColumn('legal_decisions', 'court_abbreviation')) {
                $table->string('court_abbreviation', 50)->nullable()->after('court_type');
            }
            if (!Schema::hasColumn('legal_decisions', 'court_place')) {
                $table->string('court_place')->nullable()->after('court_abbreviation');
            }
            if (!Schema::hasColumn('legal_decisions', 'decision_date')) {
                $table->date('decision_date')->nullable()->after('court_place');
            }
            if (!Schema::hasColumn('legal_decisions', 'source')) {
                $table->string('source')->nullable()->after('decision_date');
            }
            if (!Schema::hasColumn('legal_decisions', 'subject')) {
                $table->string('subject')->nullable()->after('source');
            }
            if (!Schema::hasColumn('legal_decisions', 'language')) {
                $table->string('language', 100)->default('Bahasa Indonesia')->after('status');
            }
            if (!Schema::hasColumn('legal_decisions', 'legal_field')) {
                $table->string('legal_field')->nullable()->after('language');
            }
            if (!Schema::hasColumn('legal_decisions', 'location')) {
                $table->string('location')->nullable()->after('legal_field');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('legal_decisions', function (Blueprint $table) {
            $cols = array_filter([
                'document_type',
                'teu',
                'court_abbreviation',
                'court_place',
                'decision_date',
                'source',
                'subject',
                'language',
                'legal_field',
                'location',
            ], fn (string $col) => Schema::hasColumn('legal_decisions', $col));

            if (!empty($cols)) {
                $table->dropColumn(array_values($cols));
            }
        });
    }
};
