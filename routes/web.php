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
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Protected Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User Management (Make sure only admins can access this later, but for now we group it in auth)
    Route::resource('users', UserController::class)->except(['show']);
    Route::resource('buildings', BuildingController::class)->except(['create', 'show', 'edit']);
    Route::resource('floors', FloorController::class)->except(['create', 'show', 'edit']);
    Route::resource('stalls', StallController::class)->except(['create', 'show', 'edit']);
    // Inside your auth middleware group:
    Route::get('/mapper', [LayoutController::class, 'mapper'])->name('layouts.mapper');
    Route::post('/mapper/generate', [LayoutController::class, 'generate'])->name('layouts.generate');
    Route::post('/mapper/{layout}/save', [LayoutController::class, 'saveMap'])->name('layouts.save');
    Route::resource('tenants', TenantController::class)->except(['create', 'show', 'edit']);
    Route::resource('contracts', ContractController::class)->only(['index', 'store']);
    Route::resource('payments', PaymentController::class)->only(['index', 'store']);
});

require __DIR__ . '/auth.php';
