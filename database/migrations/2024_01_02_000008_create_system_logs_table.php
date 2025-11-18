<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['api_error', 'cron_job', 'slow_query', 'general']);
            $table->string('message');
            $table->text('details')->nullable();
            $table->enum('level', ['info', 'warning', 'error'])->default('info');
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index(['type', 'created_at']);
            $table->index('level');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
