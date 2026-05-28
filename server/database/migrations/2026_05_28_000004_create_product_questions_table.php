<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Customer Q&A on product pages. One row per question. Answer is stored
 * inline (single field) for simplicity — most product Q&A is "best
 * official answer" rather than threaded discussion. When that changes,
 * promote `answer` to a separate `product_answers` table with FKs.
 */
class CreateProductQuestionsTable extends Migration
{
    public function up()
    {
        Schema::create('product_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('author_name', 120);
            $table->text('question');
            $table->text('answer')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->boolean('is_published')->default(true);

            $table->timestamps();

            $table->index(['product_id', 'is_published']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_questions');
    }
}
