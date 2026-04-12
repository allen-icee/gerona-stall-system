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
use App\Http\Controllers\ReportController;
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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // 1. ADMIN / EEDO ONLY ROUTES
    Route::middleware(['can:manage users'])->group(function () {
        Route::resource('users', UserController::class)->except(['show']);
    });

    Route::middleware(['can:manage facilities'])->group(function () {
        Route::get('buildings/export', [BuildingController::class, 'export'])->name('buildings.export');
        Route::post('buildings/import', [BuildingController::class, 'import'])->name('buildings.import');
        Route::resource('buildings', BuildingController::class)->except(['create', 'show', 'edit']);

        Route::get('floors/export', [FloorController::class, 'export'])->name('floors.export');
        Route::post('floors/import', [FloorController::class, 'import'])->name('floors.import');
        Route::resource('floors', FloorController::class)->except(['create', 'show', 'edit']);

        Route::get('stalls/export', [StallController::class, 'export'])->name('stalls.export');
        Route::post('stalls/import', [StallController::class, 'import'])->name('stalls.import');

        // 🔥 ADDED QUICK STATUS ROUTE HERE 🔥
        Route::post('stalls/{stall}/quick-status', [StallController::class, 'quickStatus'])->name('stalls.quick-status');

        Route::resource('stalls', StallController::class)->except(['create', 'show', 'edit']);
        Route::post('stalls/bulk-update', [StallController::class, 'bulkUpdate'])->name('stalls.bulk_update');
        Route::post('stalls/bulk-destroy', [StallController::class, 'bulkDestroy'])->name('stalls.bulk_destroy');

        Route::get('/mapper', [LayoutController::class, 'mapper'])->name('layouts.mapper');
        Route::post('/mapper/generate', [LayoutController::class, 'generate'])->name('layouts.generate');
        Route::post('/mapper/{layout}/expand', [LayoutController::class, 'expand'])->name('layouts.expand');
        Route::post('/mapper/{layout}/shrink', [LayoutController::class, 'shrink'])->name('layouts.shrink');
        Route::post('/mapper/{layout}/save', [LayoutController::class, 'saveMap'])->name('layouts.save');
    });

    Route::middleware(['can:manage tenants'])->group(function () {
        Route::get('tenants/export', [TenantController::class, 'export'])->name('tenants.export');
        Route::post('tenants/import', [TenantController::class, 'import'])->name('tenants.import');
        Route::resource('tenants', TenantController::class)->except(['create', 'show', 'edit']);
    });

    Route::middleware(['can:manage contracts'])->group(function () {
        Route::post('contracts/import', [ContractController::class, 'import'])->name('contracts.import');
        Route::resource('contracts', ContractController::class)->except(['index', 'create', 'show', 'edit']);
    });

    // 2. TREASURY ONLY ROUTES
    Route::middleware(['can:manage payments'])->group(function () {
        Route::get('payments/export', [PaymentController::class, 'export'])->name('payments.export');
        Route::post('payments/import', [PaymentController::class, 'import'])->name('payments.import');
        Route::get('payments/{payment}/print', [PaymentController::class, 'print'])->name('payments.print');
        Route::resource('payments', PaymentController::class);
    });

    // 3. SHARED ROUTES (Both Admin & Treasury Access)
    Route::middleware(['can:view contracts'])->group(function () {
        Route::get('contracts/export', [ContractController::class, 'export'])->name('contracts.export');
        Route::get('contracts', [ContractController::class, 'index'])->name('contracts.index');
    });

    Route::middleware(['can:view reports'])->group(function () {
        Route::get('/reports/master-ledger', [ReportController::class, 'masterLedger'])->name('reports.master_ledger');
        Route::get('/reports/master-ledger/export', [ReportController::class, 'exportLedger'])->name('reports.master_ledger.export');
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/balances', [ReportController::class, 'balances'])->name('balances');
            Route::get('/closures', [ReportController::class, 'closures'])->name('closures');
            Route::get('/balances/export', [ReportController::class, 'exportBalances'])->name('balances.export');
        });
    });
});

require __DIR__ . '/auth.php';
