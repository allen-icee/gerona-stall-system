<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\StallController;
use App\Http\Controllers\LayoutController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\DashboardController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Protected Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User Management (Make sure only admins can access this later, but for now we group it in auth)
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('buildings', BuildingController::class)->except(['create', 'show', 'edit']);
    // --- Buildings ---
    Route::get('buildings/export', [BuildingController::class, 'export'])->name('buildings.export');
    Route::post('buildings/import', [BuildingController::class, 'import'])->name('buildings.import');
    Route::resource('buildings', BuildingController::class)->except(['create', 'show', 'edit']);

    // --- Floors ---
    Route::get('floors/export', [FloorController::class, 'export'])->name('floors.export');
    Route::post('floors/import', [FloorController::class, 'import'])->name('floors.import');
    Route::resource('floors', FloorController::class)->except(['create', 'show', 'edit']);

    // --- Stalls ---
    Route::get('stalls/export', [StallController::class, 'export'])->name('stalls.export');
    Route::post('stalls/import', [StallController::class, 'import'])->name('stalls.import');
    Route::resource('stalls', StallController::class)->except(['create', 'show', 'edit']);  // Inside your auth middleware group:
    Route::get('/mapper', [LayoutController::class, 'mapper'])->name('layouts.mapper');
    Route::post('/mapper/generate', [LayoutController::class, 'generate'])->name('layouts.generate');
    Route::post('/mapper/{layout}/save', [LayoutController::class, 'saveMap'])->name('layouts.save');
    Route::post('layouts/{layout}/expand', [App\Http\Controllers\LayoutController::class, 'expand'])->name('layouts.expand');
    // ADD THIS NEW ROUTE:
    Route::post('layouts/{layout}/shrink', [App\Http\Controllers\LayoutController::class, 'shrink'])->name('layouts.shrink');
    Route::post('layouts/{layout}/save', [App\Http\Controllers\LayoutController::class, 'saveMap'])->name('layouts.save');
    Route::resource('tenants', TenantController::class)->except(['create', 'show', 'edit']);
    Route::get('tenants/export', [TenantController::class, 'export'])->name('tenants.export');
    Route::post('tenants/import', [TenantController::class, 'import'])->name('tenants.import');
    Route::get('contracts/export', [ContractController::class, 'export'])->name('contracts.export');
    Route::post('contracts/import', [ContractController::class, 'import'])->name('contracts.import');
    Route::resource('contracts', ContractController::class); // Remove the ->only(['index', 'store']) if it's there
    Route::get('payments/export', [PaymentController::class, 'export'])->name('payments.export');
    Route::post('payments/import', [PaymentController::class, 'import'])->name('payments.import');
    Route::resource('payments', PaymentController::class); // Remove ->only(['index', 'store']) if it exists
});

require __DIR__ . '/auth.php';
