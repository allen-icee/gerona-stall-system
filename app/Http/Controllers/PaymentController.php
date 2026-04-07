<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Contract;
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
        $query = Payment::with(['contract.stall.building', 'contract.tenant', 'encoder']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('or_number', 'like', $searchTerm)
                ->orWhere('month', 'like', $searchTerm)
                ->orWhere('year', 'like', $searchTerm)
                ->orWhereHas('contract.tenant', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                        ->orWhere('last_name', 'like', $searchTerm)
                        ->orWhere('company_name', 'like', $searchTerm);
                })
                ->orWhereHas('contract.stall', function ($q) use ($searchTerm) {
                    $q->where('stall_code', 'like', $searchTerm);
                });
        }

        $payments = $query->latest('payment_date')->paginate(15)->withQueryString();

        $activeContracts = Contract::with(['stall.building', 'tenant'])
            ->where('is_active', true)
            ->get()
            ->map(function ($contract) {
                $contract->append([
                    'total_paid',
                    'months_active',
                    'expected_rent',
                    'outstanding_balance',
                    'advanced_payment'
                ]);
                return $contract;
            });

        // 🔥 NEW: Treasury KPIs for the Dashboard
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
            'filters' => $request->only(['search']),
            'stats' => $stats // Passing the KPIs to React
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

        Payment::create([
            'contract_id' => $validated['contract_id'],
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'month' => $validated['month'],
            'year' => $validated['year'],
            'or_number' => $validated['or_number'],
            'encoded_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Official Receipt (OR) successfully recorded!');
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

    public function export()
    {
        $payments = Payment::with(['contract.stall', 'contract.tenant', 'encoder'])
            ->orderBy('payment_date', 'desc')
            ->get();

        $csvData = "or_number,tenant_first_name,tenant_last_name,amount,payment_date,month,year\n";

        foreach ($payments as $payment) {
            $tenantFirst = ($payment->contract && $payment->contract->tenant) ? '"' . str_replace('"', '""', $payment->contract->tenant->first_name) . '"' : '""';
            $tenantLast = ($payment->contract && $payment->contract->tenant) ? '"' . str_replace('"', '""', $payment->contract->tenant->last_name) . '"' : '""';

            $csvData .= "{$payment->or_number},{$tenantFirst},{$tenantLast},{$payment->amount},{$payment->payment_date},{$payment->month},{$payment->year}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="payments_export.csv"');
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
        // Eager load the required relationships so the React page has the data
        $payment->load(['contract.tenant', 'contract.stall', 'encoder']);

        return Inertia::render('Payments/Print', [
            'payment' => $payment
        ]);
    }
}