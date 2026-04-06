<?php

namespace App\Http\Controllers;

use App\Models\Stall;
use App\Models\Contract;
use App\Models\Payment;
use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. High-Level KPI Statistics (Kept for your StatCards & Progress Bar)
        $totalStalls = Stall::count();
        $vacantStalls = Stall::doesntHave('contracts', 'and', function ($query) {
            $query->where('is_active', true);
        })->count();

        $stats = [
            'total_stalls' => $totalStalls,
            'occupied' => $totalStalls - $vacantStalls, // Anything not vacant is occupied in some capacity
            'vacant' => $vacantStalls,
            'maintenance' => Stall::whereHas('contracts', function ($q) {
                $q->where('is_active', true)->where('permit_status', 'Waiting');
            })->count(), // Repurposed for "Waiting Permit"
        ];

        // 2. 🔥 THE EXECUTIVE SUMMARY ENGINE (Grouped by Building) 🔥
        // We load all buildings and their stalls, then tally the Phase 3 computed statuses.
        $buildings = Building::with([
            'stalls.contracts' => function ($q) {
                $q->where('is_active', true)->latest();
            }
        ])->get();

        $buildingSummary = $buildings->map(function ($building) {
            $stalls = $building->stalls;

            // Initialize our Excel columns
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
                // This magically calls the logic we wrote in Stall.php!
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

        // 3. Recent Activity (Latest 5 Contracts)
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

        return inertia('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'buildingSummary' => $buildingSummary // Passed to React!
        ]);
    }
}