<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\CultivationController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\CraftingController;
use App\Http\Controllers\RealmCombatController;
use App\Http\Controllers\MarketController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| Thiên Đạo Online - Laravel 12 API Routes
|--------------------------------------------------------------------------
*/

// Health & DB Diagnostic Checks
Route::get('/health', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Thiên Đạo Online Laravel 12 Backend API Server is running smoothly!',
        'timestamp' => now()->toIso8601String(),
    ]);
});
Route::get('/test-db', [AuthController::class, 'testDatabase']);

// Authentication API Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// Character API Routes
Route::prefix('character')->group(function () {
    Route::get('/me', [CharacterController::class, 'show']);
    Route::post('/create', [CharacterController::class, 'create']);
    Route::post('/roll-spiritual-root', [CharacterController::class, 'rollSpiritualRoot']);
});

// Cultivation API Routes
Route::prefix('cultivation')->group(function () {
    Route::post('/meditate', [CultivationController::class, 'meditate']);
    Route::post('/attempt-breakthrough', [CultivationController::class, 'attemptBreakthrough']);
});

// Inventory & Equipment API Routes
Route::prefix('inventory')->group(function () {
    Route::get('/', [InventoryController::class, 'index']);
    Route::post('/equip', [InventoryController::class, 'equip']);
    Route::post('/unequip', [InventoryController::class, 'unequip']);
    Route::post('/sell', [InventoryController::class, 'sell']);
});

// Crafting (Alchemy & Forging) API Routes
Route::prefix('crafting')->group(function () {
    Route::get('/recipes', [CraftingController::class, 'recipes']);
    Route::post('/forge', [CraftingController::class, 'forge']);
    Route::post('/brew-alchemy', [CraftingController::class, 'brewAlchemy']);
});

// Secret Realms & Combat API Routes
Route::prefix('secret-realms')->group(function () {
    Route::get('/bosses', [RealmCombatController::class, 'bosses']);
    Route::post('/challenge', [RealmCombatController::class, 'challengeBoss']);
});

// Market & Auction API Routes
Route::prefix('market')->group(function () {
    Route::get('/listings', [MarketController::class, 'listings']);
    Route::post('/buy', [MarketController::class, 'buy']);
    Route::post('/bid', [MarketController::class, 'bidAuction']);
});

// Admin Control Panel API Routes
Route::prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'indexUsers']);
    Route::post('/users', [AdminController::class, 'createUser']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::post('/users/{id}/toggle-ban', [AdminController::class, 'toggleBan']);
    Route::post('/broadcast', [AdminController::class, 'broadcast']);
});
