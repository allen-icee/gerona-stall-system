<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Contract;
use App\Models\Building;
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

        // 1. Text Search
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

        // 2. 🔥 NEW: Advanced Filtering
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

        // 3. 🔥 NEW: Bulletproof Sorting
        $allowedSorts = ['payment_date', 'or_number', 'amount', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'payment_date';
        $direction = strtolower($request->input('direction')) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $direction);

        $payments = $query->paginate(15)->withQueryString();

        $activeContracts = Contract::with(['stall.floor.building', 'tenant'])
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
            'stats' => $stats
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'month' => 'required|string|max:20',
            'year' => 'required|integer|min:2000',
            'or_number' => 'required|string|unique:payments,or_number',
        ]);

        $payment = Payment::create([
            'contract_id' => $validated['contract_id'],
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'month' => $validated['month'],
            'year' => $validated['year'],
            'or_number' => $validated['or_number'],
            'encoded_by' => Auth::id(),
        ]);

        // 🔥 THE FIX: Pass the newly created payment ID back to React to trigger Auto-Print
        return redirect()->back()->with([
            'success' => 'Official Receipt successfully recorded!',
            'recent_payment_id' => $payment->id
        ]);
    }

    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'month' => 'required|string|max:20',
            'year' => 'required|integer|min:2000',
            'or_number' => 'required|string|unique:payments,or_number,' . $payment->id,
        ]);

        $payment->update($validated);
        return redirect()->back()->with('success', 'Payment record successfully updated!');
    }

    public function destroy(Payment $payment)
    {
        DB::transaction(function () use ($payment) {
            $payment->delete();
        });
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
        $csvData = "or_number,tenant_first_name,tenant_last_name,stall_code,amount,payment_date,month,year\n";

        foreach ($payments as $payment) {
            $tenantFirst = ($payment->contract && $payment->contract->tenant) ? '"' . str_replace('"', '""', $payment->contract->tenant->first_name) . '"' : '""';
            $tenantLast = ($payment->contract && $payment->contract->tenant) ? '"' . str_replace('"', '""', $payment->contract->tenant->last_name) . '"' : '""';
            $stallCode = ($payment->contract && $payment->contract->stall) ? '"' . str_replace('"', '""', $payment->contract->stall->stall_code) . '"' : '""';

            $csvData .= "{$payment->or_number},{$tenantFirst},{$tenantLast},{$stallCode},{$payment->amount},{$payment->payment_date},{$payment->month},{$payment->year}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="filtered_payments_export.csv"');
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
        $payment->load(['contract.tenant', 'contract.stall.floor.building', 'encoder']);
        return Inertia::render('Payments/Print', [
            'payment' => $payment
        ]);
    }
}