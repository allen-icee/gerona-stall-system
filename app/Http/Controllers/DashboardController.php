<?php

namespace App\Http\Controllers;

use App\Models\Stall;
use App\Models\Contract;
use App\Models\Payment;
use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        // Spatie provides getRoleNames(), we just grab the first one (e.g., 'admin', 'treasury', 'staff')
        $userRole = $user->getRoleNames()->first() ?? 'staff';

        // 1. High-Level KPI Statistics
        $totalStalls = Stall::count();
        $vacantStalls = Stall::doesntHave('contracts', 'and', function ($query) {
            $query->where('is_active', true);
        })->count();

        $stats = [
            'total_stalls' => $totalStalls,
            'occupied' => $totalStalls - $vacantStalls,
            'vacant' => $vacantStalls,
            'maintenance' => Stall::whereHas('contracts', function ($q) {
                $q->where('is_active', true)->where('permit_status', 'Waiting');
            })->count(),

            // 🔥 NEW: Add Treasury KPIs to global stats so they can be shown if role == treasury
            'today_collection' => Payment::whereDate('payment_date', Carbon::today())->sum('amount'),
            'month_collection' => Payment::whereMonth('payment_date', Carbon::now()->month)
                ->whereYear('payment_date', Carbon::now()->year)
                ->sum('amount'),
            'total_ors' => Payment::count()
        ];

        // 2. THE EXECUTIVE SUMMARY ENGINE (Only really needed for Admin, but safe to load)
        $buildings = Building::with([
            'stalls.contracts' => function ($q) {
                $q->where('is_active', true)->latest();
            }
        ])->get();

        $buildingSummary = $buildings->map(function ($building) {
            $stalls = $building->stalls;
            $tally = [
                'name' => $building->name,
                'total' => $stalls->count(),
                'vacant' => 0,
                'for_contract' => 0,
                'for_signing' => 0,
                'waiting_permit' => 0,
                'on_process' => 0,
                'for_confirmation' => 0,
                'unpaid' => 0,
                'signed_valid' => 0,
                'closed' => 0,
            ];

            foreach ($stalls as $stall) {
                $label = $stall->computed_status['label'];
                switch ($label) {
                    case 'VACANT':
                        $tally['vacant']++;
                        break;
                    case 'FOR CONTRACT':
                        $tally['for_contract']++;
                        break;
                    case 'FOR SIGNING':
                        $tally['for_signing']++;
                        break;
                    case 'WAITING FOR BUSINESS PERMIT':
                        $tally['waiting_permit']++;
                        break;
                    case 'ON PROCESS':
                        $tally['on_process']++;
                        break;
                    case 'FOR CONFIRMATION':
                        $tally['for_confirmation']++;
                        break;
                    case 'UNPAID PERMIT':
                        $tally['unpaid']++;
                        break;
                    case 'SIGNED CONTRACT':
                        $tally['signed_valid']++;
                        break;
                    case 'CLOSED':
                        $tally['closed']++;
                        break;
                }
            }
            return $tally;
        });

        // 3. Recent Activity
        $recentActivity = Contract::with(['stall', 'tenant'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($contract) {
                return [
                    'stall_code' => $contract->stall->stall_code ?? 'N/A',
                    'tenant_name' => $contract->tenant ? $contract->tenant->first_name . ' ' . $contract->tenant->last_name : 'No Tenant',
                    'action' => 'Contract Updated',
                    'date' => $contract->updated_at->format('M d, Y'),
                ];
            });

        // 4. Expiring Contracts (Action Required)
        $expiringContracts = Contract::with('stall')
            ->where('is_active', true)
            ->where('end_date', '<=', Carbon::now()->addDays(30))
            ->get()
            ->map(function ($contract) {
                return [
                    'stall' => $contract->stall->stall_code ?? 'N/A',
                    'days_left' => Carbon::now()->diffInDays(Carbon::parse($contract->end_date), false)
                ];
            });

        return inertia('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'buildingSummary' => $buildingSummary,
            'expiringContracts' => $expiringContracts,
            'userRole' => strtolower($userRole) // 🔥 Pass the role to React!
        ]);
    }
}