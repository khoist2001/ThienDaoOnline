<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations for Thiên Đạo Online.
     */
    public function up(): void
    {
        // 1. Users Table
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->text('two_factor_secret')->nullable();
                $table->text('two_factor_recovery_codes')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });
        }

        // 2. Sects Table
        if (!Schema::hasTable('sects')) {
            Schema::create('sects', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('leader_id')->nullable();
                $table->timestamps();
            });
        }

        // 3. Realms Table
        if (!Schema::hasTable('realms')) {
            Schema::create('realms', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->integer('order_level');
                $table->bigInteger('required_exp');
                $table->integer('hp_bonus');
                $table->integer('atk_bonus');
                $table->string('aura_effect')->default('gold');
                $table->timestamps();
            });
        }

        // 4. Spiritual Roots Table
        if (!Schema::hasTable('spiritual_roots')) {
            Schema::create('spiritual_roots', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->decimal('exp_multiplier', 5, 2)->default(1.00);
                $table->string('element');
                $table->timestamps();
            });
        }

        // 5. Characters Table
        if (!Schema::hasTable('characters')) {
            Schema::create('characters', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('name');
                $table->string('title')->default('Vô Danh Tu Sĩ');
                $table->string('avatar')->nullable();
                $table->string('avatar_frame')->default('gold');
                $table->integer('vip_level')->default(1);
                $table->foreignId('realm_id')->constrained('realms');
                $table->foreignId('spiritual_root_id')->constrained('spiritual_roots');
                $table->foreignId('sect_id')->nullable()->constrained('sects')->nullOnDelete();
                $table->bigInteger('exp')->default(0);
                $table->bigInteger('max_exp')->default(100);
                $table->integer('hp')->default(500);
                $table->integer('max_hp')->default(500);
                $table->integer('mana')->default(250);
                $table->integer('max_mana')->default(250);
                $table->integer('spiritual_power')->default(100);
                $table->bigInteger('spirit_stones')->default(500);
                $table->integer('combat_power')->default(1000);
                $table->integer('lifespan')->default(18);
                $table->integer('max_lifespan')->default(100);
                $table->integer('reputation')->default(0);
                $table->timestamps();
            });
        }

        // 6. Items Table
        if (!Schema::hasTable('items')) {
            Schema::create('items', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->enum('type', ['Equipment', 'Pill', 'Material', 'Artifact', 'Pet']);
                $table->enum('rarity', ['Phàm', 'Linh', 'Huyền', 'Địa', 'Thiên', 'Tiên', 'Thần']);
                $table->text('description')->nullable();
                $table->string('icon')->nullable();
                $table->integer('value')->default(100);
                $table->timestamps();
            });
        }

        // 7. Inventory Table
        if (!Schema::hasTable('inventory')) {
            Schema::create('inventory', function (Blueprint $table) {
                $table->id();
                $table->foreignId('character_id')->constrained()->onDelete('cascade');
                $table->foreignId('item_id')->constrained()->onDelete('cascade');
                $table->integer('quantity')->default(1);
                $table->boolean('is_equipped')->default(false);
                $table->timestamps();
            });
        }

        // 8. Pets Table
        if (!Schema::hasTable('pets')) {
            Schema::create('pets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('character_id')->constrained()->onDelete('cascade');
                $table->string('name');
                $table->string('rarity');
                $table->integer('level')->default(1);
                $table->integer('exp')->default(0);
                $table->string('skill')->nullable();
                $table->integer('combat_bonus')->default(100);
                $table->timestamps();
            });
        }

        // 9. Guilds Table
        if (!Schema::hasTable('guilds')) {
            Schema::create('guilds', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->integer('level')->default(1);
                $table->bigInteger('vault_stones')->default(0);
                $table->foreignId('leader_id')->constrained('characters');
                $table->timestamps();
            });
        }

        // 10. Market Table
        if (!Schema::hasTable('market')) {
            Schema::create('market', function (Blueprint $table) {
                $table->id();
                $table->foreignId('seller_id')->constrained('characters');
                $table->foreignId('item_id')->constrained('items');
                $table->integer('price');
                $table->timestamps();
            });
        }

        // Seed Initial Data
        $this->seedInitialData();
    }

    /**
     * Seed initial Xianxia game data into tables.
     */
    private function seedInitialData(): void
    {
        // Realms
        DB::table('realms')->insertOrIgnore([
            ['id' => 1, 'name' => 'Luyện Khí', 'order_level' => 1, 'required_exp' => 100, 'hp_bonus' => 500, 'atk_bonus' => 100, 'aura_effect' => 'gold-subtle'],
            ['id' => 2, 'name' => 'Trúc Cơ', 'order_level' => 2, 'required_exp' => 300, 'hp_bonus' => 1200, 'atk_bonus' => 350, 'aura_effect' => 'jade-glow'],
            ['id' => 3, 'name' => 'Kim Đan', 'order_level' => 3, 'required_exp' => 800, 'hp_bonus' => 3000, 'atk_bonus' => 900, 'aura_effect' => 'gold-shimmer'],
            ['id' => 4, 'name' => 'Nguyên Anh', 'order_level' => 4, 'required_exp' => 2000, 'hp_bonus' => 7500, 'atk_bonus' => 2400, 'aura_effect' => 'purple-aura'],
            ['id' => 5, 'name' => 'Hóa Thần', 'order_level' => 5, 'required_exp' => 5000, 'hp_bonus' => 18000, 'atk_bonus' => 6000, 'aura_effect' => 'crimson-aura'],
            ['id' => 11, 'name' => 'Tiên Đế', 'order_level' => 11, 'required_exp' => 3000000, 'hp_bonus' => 999999, 'atk_bonus' => 999999, 'aura_effect' => 'godly-rainbow'],
        ]);

        // Spiritual Roots
        DB::table('spiritual_roots')->insertOrIgnore([
            ['id' => 1, 'name' => 'Kim', 'exp_multiplier' => 1.10, 'element' => 'Kim'],
            ['id' => 4, 'name' => 'Hỏa', 'exp_multiplier' => 1.15, 'element' => 'Hỏa'],
            ['id' => 8, 'name' => 'Thiên Linh Căn', 'exp_multiplier' => 2.00, 'element' => 'Thái Cực'],
        ]);

        // Sects
        DB::table('sects')->insertOrIgnore([
            ['id' => 1, 'name' => 'Thanh Vân Tông', 'description' => 'Chính đạo danh môn, công pháp đạo gia thuần khiết'],
            ['id' => 2, 'name' => 'Vạn Kiếm Sơn', 'description' => 'Kiếm tu vô song, nhất kiếm phá vạn pháp'],
            ['id' => 3, 'name' => 'Thái Hư Cung', 'description' => 'Ảo diệu vô cùng, tinh thông trận pháp phù lục'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market');
        Schema::dropIfExists('guilds');
        Schema::dropIfExists('pets');
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('items');
        Schema::dropIfExists('characters');
        Schema::dropIfExists('spiritual_roots');
        Schema::dropIfExists('realms');
        Schema::dropIfExists('sects');
        Schema::dropIfExists('users');
    }
};
