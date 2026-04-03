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
        // 1. KPI Statistics
        $stats = [
            'total_stalls' => Stall::count(),
            'occupied' => Stall::whereHas('status', function ($q) {
                $q->where('name', 'like', '%Signed contract%');
            })->count(),
            'vacant' => Stall::whereHas('status', function ($q) {
                $q->where('name', 'VACANT');
            })->count(),
            'maintenance' => Stall::whereHas('status', function ($q) {
                $q->where('name', 'like', '%Repair%')->orWhere('name', 'like', '%Maintenance%');
            })->count(),
        ];

        // 2. Recent Activity (Latest 5 Contracts)
        $recentActivity = Contract::with(['stall', 'tenant'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($contract) {
                return [
                    'stall_code' => $contract->stall->stall_code ?? 'N/A',
                    'tenant_name' => $contract->tenant->first_name . ' ' . $contract->tenant->last_name,
                    'action' => 'Contract Signed',
                    'date' => Carbon::parse($contract->created_at)->format('M d, Y'),
                ];
            });

        // 3. Action Required (Expiring Contracts in next 30 days)
        $expiringContracts = Contract::with(['stall', 'tenant'])
            ->whereBetween('end_date', [Carbon::now(), Carbon::now()->addDays(30)])
            ->get()
            ->map(function ($contract) {
                return [
                    'tenant' => $contract->tenant->first_name . ' ' . $contract->tenant->last_name,
                    'stall' => $contract->stall->stall_code ?? 'N/A',
                    'days_left' => Carbon::now()->diffInDays(Carbon::parse($contract->end_date)),
                ];
            });

        // 4. Revenue Data for Chart (Last 6 Months)
        // Grouping payments by month for the Recharts component
        $revenueData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = strtoupper($month->format('F')); // e.g., "MARCH"
            $year = $month->year;

            $total = Payment::where('month', $monthName)->where('year', $year)->sum('amount');

            $revenueData[] = [
                'month' => $month->format('M'), // Short name for chart axis
                'revenue' => (float) $total,
                'target' => 250000 // Set a static LGU target or make this dynamic later
            ];
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'expiringContracts' => $expiringContracts,
            'revenueData' => $revenueData,
        ]);
    }
}
