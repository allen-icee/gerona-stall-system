<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Payment;
use App\Models\Building;
use App\Models\Stall;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;

class ReportController extends Controller
{
    private function applyContractFilters($query, Request $request)
    {
        if ($request->filled('building_id')) {
            $query->whereHas('stall.floor', function ($q) use ($request) {
                $q->where('building_id', $request->building_id);
            });
        }
        if ($request->filled('stall_id')) {
            $query->where('stall_id', $request->stall_id);
        }
        if ($request->filled('month')) {
            $query->whereMonth('start_date', $request->month);
        }
        if ($request->filled('year')) {
            $query->whereYear('start_date', $request->year);
        }
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->whereHas('tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                    ->orWhere('last_name', 'like', $searchTerm);
            });
        }
        return $query;
    }

    public function balances(Request $request)
    {
        $query = Contract::with(['tenant', 'stall.floor.building', 'payments'])->where('is_active', true);
        $query = $this->applyContractFilters($query, $request);

        $allowedSorts = ['tenant_name', 'stall_code', 'total_outstanding'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'tenant_name';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        $contracts = $query->get();

        $withBalance = $contracts->filter(function ($contract) {
            return $contract->total_outstanding > 0;
        })->map(function ($contract) {
            return [
                'id' => $contract->id,
                'tenant_name' => $contract->tenant->last_name . ', ' . $contract->tenant->first_name,
                'stall_code' => $contract->stall->stall_code ?? 'N/A',
                'location' => ($contract->stall->floor->name ?? '') . ' - ' . ($contract->stall->floor->building->name ?? ''),
                'monthly_rent' => $contract->monthly_rent,
                'deposit_variance' => $contract->deposit_variance,
                'outstanding_rent' => $contract->outstanding_balance,
                'total_outstanding' => $contract->total_outstanding,
                'last_payment_date' => $contract->payments->last() ? $contract->payments->last()->created_at->format('M d, Y') : 'No Payments on Record',
            ];
        });

        if ($sortBy === 'total_outstanding') {
            $withBalance = $direction === 'asc' ? $withBalance->sortBy('total_outstanding') : $withBalance->sortByDesc('total_outstanding');
        } elseif ($sortBy === 'stall_code') {
            $withBalance = $direction === 'asc' ? $withBalance->sortBy('stall_code') : $withBalance->sortByDesc('stall_code');
        } else {
            $withBalance = $direction === 'asc' ? $withBalance->sortBy('tenant_name') : $withBalance->sortByDesc('tenant_name');
        }

        // Collection Pagination
        $page = Paginator::resolveCurrentPage() ?: 1;
        $perPage = 20;
        $paginatedBalances = new LengthAwarePaginator(
            $withBalance->forPage($page, $perPage)->values(),
            $withBalance->count(),
            $perPage,
            $page,
            ['path' => Paginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        $buildings = Building::orderBy('name', 'asc')->get();
        $stalls = Stall::orderBy('stall_code', 'asc')->get();

        return Inertia::render('Reports/Balances', [
            'balances' => $paginatedBalances,
            'buildings' => $buildings,
            'stalls' => $stalls,
            'filters' => $request->only(['search', 'sort', 'direction', 'building_id', 'month', 'year', 'stall_id']),
        ]);
    }

    public function closures(Request $request)
    {
        $query = Contract::with(['tenant', 'stall.floor.building', 'payments'])->where('is_active', true);
        $query = $this->applyContractFilters($query, $request);

        $allowedSorts = ['tenant_name', 'stall_code', 'total_outstanding'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'total_outstanding';
        $direction = strtolower($request->input('direction')) === 'asc' ? 'asc' : 'desc';

        $contracts = $query->get();

        // Removed the deleted permit_status requirement
        $closures = $contracts->filter(function ($contract) {
            return $contract->total_outstanding >= 10000;
        })->map(function ($contract) {
            return [
                'id' => $contract->id,
                'tenant_name' => $contract->tenant->last_name . ', ' . $contract->tenant->first_name,
                'stall_code' => $contract->stall->stall_code ?? 'N/A',
                'total_outstanding' => $contract->total_outstanding,
                'reason' => 'Severe Delinquency (Owes ₱' . number_format($contract->total_outstanding, 2) . ')',
                'severity' => 'high' // Can change to critical if preferred
            ];
        });

        if ($sortBy === 'total_outstanding') {
            $closures = $direction === 'asc' ? $closures->sortBy('total_outstanding') : $closures->sortByDesc('total_outstanding');
        } elseif ($sortBy === 'stall_code') {
            $closures = $direction === 'asc' ? $closures->sortBy('stall_code') : $closures->sortByDesc('stall_code');
        } else {
            $closures = $direction === 'asc' ? $closures->sortBy('tenant_name') : $closures->sortByDesc('tenant_name');
        }

        // Collection Pagination
        $page = \Illuminate\Pagination\Paginator::resolveCurrentPage() ?: 1;
        $perPage = 20;
        $paginatedClosures = new \Illuminate\Pagination\LengthAwarePaginator(
            $closures->forPage($page, $perPage)->values(),
            $closures->count(),
            $perPage,
            $page,
            ['path' => \Illuminate\Pagination\Paginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        $buildings = Building::orderBy('name', 'asc')->get();
        $stalls = Stall::orderBy('stall_code', 'asc')->get();

        return Inertia::render('Reports/Closures', [
            'closures' => $paginatedClosures,
            'buildings' => $buildings,
            'stalls' => $stalls,
            'filters' => $request->only(['search', 'sort', 'direction', 'building_id', 'month', 'year', 'stall_id']),
        ]);
    }

    public function masterLedger(Request $request)
    {
        $query = Payment::with(['contract.stall.floor.building', 'contract.tenant']);

        if ($request->filled('building_id')) {
            $query->whereHas('contract.stall.floor', function ($q) use ($request) {
                $q->where('building_id', $request->building_id);
            });
        }
        if ($request->filled('stall_id')) {
            $query->whereHas('contract', function ($q) use ($request) {
                $q->where('stall_id', $request->stall_id);
            });
        }
        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('or_number', 'like', $searchTerm)
                ->orWhereHas('contract.tenant', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                        ->orWhere('last_name', 'like', $searchTerm);
                });
        }

        $allowedSorts = ['payment_date', 'or_number', 'amount'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'payment_date';
        $direction = strtolower($request->input('direction')) === 'asc' ? 'asc' : 'desc';

        $payments = $query->orderBy($sortBy, $direction)->paginate(20)->withQueryString();
        $payments->getCollection()->transform(function ($payment) {
            $monthName = $payment->month ? \Carbon\Carbon::createFromFormat('!m', $payment->month)->format('F') : 'N/A';

            return [
                'id' => $payment->id,
                'month_paid' => trim($monthName . ' ' . ($payment->year ?? '')),
                'price' => $payment->amount,
                'date' => optional($payment->payment_date)->format('M d, Y') ?? 'N/A',
                'or_number' => $payment->or_number ?? 'N/A',
                'name' => trim(($payment->contract->tenant->last_name ?? '') . ', ' . ($payment->contract->tenant->first_name ?? ''), ', ') ?: 'N/A',
                'location' => $payment->contract->stall->floor->building->name ?? 'N/A',
                'stall' => $payment->contract->stall->stall_code ?? 'N/A',
                'penalty' => $payment->payment_type === 'violation' ? $payment->amount : 0,
            ];
        });

        $buildings = Building::orderBy('name', 'asc')->get();
        $stalls = Stall::orderBy('stall_code', 'asc')->get();

        return Inertia::render('Reports/MasterLedger', [
            'ledger' => $payments,
            'ledgerData' => $payments,
            'buildings' => $buildings,
            'stalls' => $stalls,
            'filters' => $request->only(['search', 'sort', 'direction', 'building_id', 'month', 'year', 'stall_id']),
        ]);
    }

    public function exportBalances()
    {
        $contracts = Contract::with(['tenant', 'stall', 'payments'])->where('is_active', true)->get()->filter(fn($c) => $c->total_outstanding > 0);
        $csvData = "Tenant Name,Stall Code,Missing Deposit,Outstanding Rent,Total Debt\n";
        foreach ($contracts as $contract) {
            $name = '"' . str_replace('"', '""', $contract->tenant->last_name . ', ' . $contract->tenant->first_name) . '"';
            $stall = '"' . str_replace('"', '""', $contract->stall->stall_code ?? 'N/A') . '"';
            $depVar = $contract->deposit_variance > 0 ? $contract->deposit_variance : 0;
            $csvData .= "{$name},{$stall},{$depVar},{$contract->outstanding_balance},{$contract->total_outstanding}\n";
        }
        return response($csvData)->header('Content-Type', 'text/csv')->header('Content-Disposition', 'attachment; filename="LGU_With_Balances_Report.csv"');
    }

    public function exportLedger()
    {
        $payments = Payment::with(['contract.stall.floor.building', 'contract.tenant'])->orderBy('payment_date', 'desc')->get();
        $csvData = "MONTH PAID,PRICE,DATE,O.R. NUMBER,NAME,LOCATION,MARKET STALL,RENTAL PENALTY\n";

        foreach ($payments as $p) {
            $monthName = $p->month ? \Carbon\Carbon::createFromFormat('!m', $p->month)->format('F') : 'N/A';
            $month = '"' . str_replace('"', '""', $monthName . ' ' . $p->year) . '"';
            $price = '"' . str_replace('"', '""', $p->amount) . '"';
            $date = '"' . str_replace('"', '""', $p->payment_date) . '"';
            $or = '"' . str_replace('"', '""', $p->or_number) . '"';
            $name = '"' . str_replace('"', '""', $p->contract->tenant->last_name . ', ' . $p->contract->tenant->first_name) . '"';
            $loc = '"' . str_replace('"', '""', $p->contract->stall->floor->building->name ?? 'N/A') . '"';
            $stall = '"' . str_replace('"', '""', $p->contract->stall->stall_code ?? 'N/A') . '"';

            $penalty = str_contains($p->contract->remarks ?? '', '20% Late Renewal Penalty') ? '"20% APPLIED"' : '""';

            $csvData .= "{$month},{$price},{$date},{$or},{$name},{$loc},{$stall},{$penalty}\n";
        }
        return response($csvData)->header('Content-Type', 'text/csv')->header('Content-Disposition', 'attachment; filename="LGU_Master_Ledger.csv"');
    }
}
