<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('url')->unique();
            $table->string('source')->nullable();
            $table->enum('sentiment', ['positive', 'negative', 'neutral'])->default('neutral');
            $table->decimal('sentiment_score', 3, 2)->nullable();
            $table->timestamp('published_at');
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index('sentiment');
            $table->index('published_at');
            $table->index('source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
