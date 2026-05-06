<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Contract;
use App\Models\Building;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Imports\PaymentsImport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['contract.stall.floor.building', 'contract.tenant', 'encoder']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('or_number', 'like', $searchTerm)
                ->orWhereHas('contract.tenant', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                        ->orWhere('last_name', 'like', $searchTerm)
                        ->orWhere('company_name', 'like', $searchTerm);
                })
                ->orWhereHas('contract.stall', function ($q) use ($searchTerm) {
                    $q->where('stall_code', 'like', $searchTerm);
                });
        }

        if ($request->filled('building_id')) {
            $query->whereHas('contract.stall.floor', function ($q) use ($request) {
                $q->where('building_id', $request->building_id);
            });
        }
        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $allowedSorts = ['payment_date', 'or_number', 'amount', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'payment_date';
        $direction = strtolower($request->input('direction')) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $direction);

        $payments = $query->paginate(15)->withQueryString();

        $activeContracts = Contract::with(['stall.floor.building', 'tenant', 'payments', 'penalties'])
            ->where('is_active', true)
            ->get();

        $buildings = Building::orderBy('name', 'asc')->get();

        $stats = [
            'today_collection' => Payment::whereDate('payment_date', Carbon::today())->sum('amount'),
            'month_collection' => Payment::whereMonth('payment_date', Carbon::now()->month)
                ->whereYear('payment_date', Carbon::now()->year)
                ->sum('amount'),
            'total_ors' => Payment::count()
        ];

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'activeContracts' => $activeContracts,
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'sort', 'direction', 'building_id', 'month', 'year']),
            'stats' => $stats,
            'contracts_count' => \App\Models\Contract::count(),
        ]);
    }

    public function store(Request $request, PaymentService $paymentService)
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_type' => 'required|in:rent,deposit,violation',
            'month' => 'required_if:payment_type,rent|nullable|integer|between:1,12',
            'year' => 'required_if:payment_type,rent|nullable|integer|min:2000',
            'or_number' => 'required|string|unique:payments,or_number',
        ]);

        $payment = $paymentService->createPayment($validated, Auth::id() ?? 1);

        return redirect()->back()->with([
            'success' => 'Official Receipt successfully recorded!',
            'recent_payment_id' => $payment->id
        ]);
    }

    public function update(Request $request, Payment $payment, PaymentService $paymentService)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_type' => 'required|in:rent,deposit,violation',
            'month' => 'required_if:payment_type,rent|nullable|integer|between:1,12',
            'year' => 'required_if:payment_type,rent|nullable|integer|min:2000',
            'or_number' => 'required|string|unique:payments,or_number,' . $payment->id,
        ]);

        $paymentService->updatePayment($payment, $validated);

        return redirect()->back()->with('success', 'Payment record successfully updated!');
    }

    public function destroy(Payment $payment, PaymentService $paymentService)
    {
        $paymentService->deletePayment($payment);
        return redirect()->back()->with('success', 'Payment record successfully deleted.');
    }

    public function export(Request $request)
    {
        $query = Payment::with(['contract.stall.floor.building', 'contract.tenant', 'encoder']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('or_number', 'like', $searchTerm)
                ->orWhereHas('contract.tenant', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)->orWhere('last_name', 'like', $searchTerm);
                })
                ->orWhereHas('contract.stall', function ($q) use ($searchTerm) {
                    $q->where('stall_code', 'like', $searchTerm);
                });
        }

        if ($request->filled('building_id')) {
            $query->whereHas('contract.stall.floor', function ($q) use ($request) {
                $q->where('building_id', $request->building_id);
            });
        }
        if ($request->filled('month')) {
            $query->where('month', $request->month);
        }
        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $allowedSorts = ['payment_date', 'or_number', 'amount', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'payment_date';
        $direction = strtolower($request->input('direction')) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $direction);

        $payments = $query->get();

        $exportData = [];
        foreach ($payments as $payment) {
            $monthName = $payment->month ? Carbon::createFromFormat('!m', $payment->month)->format('F') : 'N/A';

            $exportData[] = [
                'or_number' => $payment->or_number,
                'payment_type' => strtoupper($payment->payment_type),
                'tenant_first_name' => $payment->contract->tenant->first_name ?? '',
                'tenant_last_name' => $payment->contract->tenant->last_name ?? '',
                'stall_code' => $payment->contract->stall->stall_code ?? '',
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date,
                'month' => $monthName,
                'year' => $payment->year ?? 'N/A',
            ];
        }

        $export = new class($exportData) implements \Maatwebsite\Excel\Concerns\FromArray, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\ShouldAutoSize {
            protected $data;
            public function __construct($data)
            {
                $this->data = $data;
            }
            public function array(): array
            {
                return $this->data;
            }
            public function headings(): array
            {
                return [
                    'or_number',
                    'payment_type',
                    'tenant_first_name',
                    'tenant_last_name',
                    'stall_code',
                    'amount',
                    'payment_date',
                    'month',
                    'year'
                ];
            }
        };

        $filename = 'payments_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        try {
            Excel::import(new PaymentsImport, $request->file('file'));
            return redirect()->back()->with('success', 'Payments synced successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed.');
        }
    }

    public function print(Payment $payment)
    {
        $payment->load(['contract.tenant', 'contract.stall', 'encoder']);

        $monthName = $payment->month ? Carbon::createFromFormat('!m', $payment->month)->format('F') : '';

        // FIX: STRICTLY ONLY THE SECTION NAME FOR ADDRESS
        $stall = $payment->contract->stall;

        // This ensures ONLY "OLD PUBLIC MARKET" shows up without duplication
        $locationAddress = trim($stall->floor->name ?? '');

        $record = [
            'business_name' => $payment->contract->tenant->company_name ?? 'Individual/Personal',
            'address' => $locationAddress ?: 'NO SECTION ASSIGNED',
            'owner' => trim(($payment->contract->tenant->first_name ?? '') . ' ' . ($payment->contract->tenant->last_name ?? '')),
            'monthly_rent' => (float) ($payment->contract->monthly_rent ?? 0),

            'payments' => [
                [
                    'month_year' => ($payment->month && $payment->year) ? $monthName . ' ' . $payment->year : Carbon::parse($payment->payment_date)->format('F Y'),
                    'amount' => (float) $payment->amount,
                    'or_number' => $payment->or_number,
                    'date' => Carbon::parse($payment->payment_date)->format('m/d/Y'),
                    'mode' => ucfirst($payment->payment_type ?? 'Cash')
                ]
            ]
        ];

        return Inertia::render('Payments/Print', [
            'record' => $record
        ]);
    }
}
