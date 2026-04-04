<?php

namespace App\Http\Controllers;

use App\Models\Stall;
use App\Models\Contract;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. KPI Statistics (Upgraded to the New Contract-Centric Architecture)
        $stats = [
            'total_stalls' => \App\Models\Stall::count(),

            // Occupied: Any stall that currently HAS an active contract
            'occupied' => \App\Models\Stall::whereHas('activeContract')->count(),

            // Vacant: Any stall that DOES NOT have an active contract
            'vacant' => \App\Models\Stall::whereDoesntHave('activeContract')->count(),

            // Maintenance: Since we removed static statuses, let's track stalls waiting for permits instead!
            // Note: I left the key as 'maintenance' so your React frontend doesn't crash,
            // but this is now tracking "Pending Permits". You can rename this in Dashboard.tsx later!
            'maintenance' => \App\Models\Stall::whereHas('activeContract', function ($q) {
                $q->where('permit_status', 'PENDING');
            })->count(),
        ];

        // 2. Recent Activity (Latest 5 Contracts)
        $recentActivity = \App\Models\Contract::with(['stall', 'tenant'])
            ->latest()
            ->take(5)
            ->get();

        return inertia('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity
        ]);
    }
}
