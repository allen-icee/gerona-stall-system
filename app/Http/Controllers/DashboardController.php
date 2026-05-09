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

        $userRole = $user->role ?? (method_exists($user, 'getRoleNames') ? $user->getRoleNames()->first() : 'staff');

        $totalStalls = Stall::count();
        $vacantStalls = Stall::doesntHave('contracts', 'and', function ($query) {
            $query->where('is_active', true);
        })->count();

        // Simplified to only track what matters now
        $stats = [
            'total_stalls' => $totalStalls,
            'occupied' => $totalStalls - $vacantStalls,
            'vacant' => $vacantStalls,
            'today_collection' => Payment::whereDate('payment_date', Carbon::today())->sum('amount'),
            'month_collection' => Payment::whereMonth('payment_date', Carbon::now()->month)
                ->whereYear('payment_date', Carbon::now()->year)
                ->sum('amount'),
            'total_ors' => Payment::count()
        ];

        $buildings = Building::with([
            'stalls.contracts' => function ($q) {
                $q->where('is_active', true)->latest();
            }
        ])->get();

        // Cleaned up tallying logic - no more complex enums
        $buildingSummary = $buildings->map(function ($building) {
            $stalls = $building->stalls;

            $vacantCount = $stalls->filter(function ($stall) {
                return empty($stall->activeContracts) || $stall->activeContracts->isEmpty();
            })->count();

            return [
                'name' => $building->name,
                'total' => $stalls->count(),
                'vacant' => $vacantCount,
                'occupied' => $stalls->count() - $vacantCount,
            ];
        });

        $recentActivity = Contract::with(['stall', 'tenant'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($contract) {
                return [
                    'stall_code' => $contract->stall->stall_code ?? 'N/A',
                    'tenant_name' => $contract->tenant
                        ? $contract->tenant->first_name . ' ' . $contract->tenant->last_name
                        : 'No Tenant',
                    'action' => 'Stall Assigned/Updated',
                    'date' => $contract->updated_at->format('M d, Y'),
                ];
            });

        $expiringContracts = Contract::with('stall')
            ->where('is_active', true)
            ->whereNotNull('end_date') // Protects against indefinite (null) assignments
            ->where('end_date', '<=', Carbon::now()->addDays(30))
            ->get()
            ->map(function ($contract) {
                return [
                    'stall' => $contract->stall->stall_code ?? 'N/A',
                    'days_left' => Carbon::now()->diffInDays(Carbon::parse($contract->end_date), false)
                ];
            });

        $serverIp = gethostbyname(gethostname());

        return inertia('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'buildingSummary' => $buildingSummary,
            'expiringContracts' => $expiringContracts,
            'userRole' => strtolower($userRole),
            'serverIp' => $serverIp
        ]);
    }
}
