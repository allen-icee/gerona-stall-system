<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Contract;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        // 1. Updated relationships: Payments now route through their Contract
        $query = Payment::with(['contract.stall.building', 'contract.tenant', 'encoder']);

        // Debounced Search Logic updated for Contract relationship
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

        $payments = $query->latest()->paginate(15)->withQueryString();

        // 2. Load active contracts WITH OUR NEW COMPUTED FINANCIAL ENGINE!
        $activeContracts = Contract::with(['stall.building', 'tenant'])
            ->where('is_active', true)
            ->get()
            ->map(function ($contract) {
                // Inject the dynamic Phase C financials so React can read them directly
                $contract->append([
                    'total_paid',
                    'months_active',
                    'expected_rent',
                    'outstanding_balance',
                    'advanced_payment'
                ]);
                return $contract;
            });

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'activeContracts' => $activeContracts,
            'filters' => $request->only(['search']),
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

        // 3. Storing strictly to the Contract, dropping redundant stall/tenant IDs
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
        // We only allow updating the transaction details, not the core contract
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
        $payment->delete();
        return redirect()->back()->with('success', 'Payment record successfully deleted.');
    }

    public function export()
    {
        $payments = Payment::with(['contract.stall', 'contract.tenant', 'encoder'])->get();
        $csvData = "ID,OR Number,Tenant,Stall,Month,Year,Amount,Date Paid,Encoder\n";

        foreach ($payments as $payment) {
            // Navigate through the contract relationship for the export!
            $tenantName = ($payment->contract && $payment->contract->tenant)
                ? $payment->contract->tenant->first_name . ' ' . $payment->contract->tenant->last_name
                : 'N/A';

            $stallCode = ($payment->contract && $payment->contract->stall)
                ? $payment->contract->stall->stall_code
                : 'N/A';

            $encoderName = $payment->encoder ? $payment->encoder->name : 'N/A';

            $csvData .= "{$payment->id},{$payment->or_number},{$tenantName},{$stallCode},{$payment->month},{$payment->year},{$payment->amount},{$payment->payment_date},{$encoderName}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="payments_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        return redirect()->back()->with('success', 'Payments imported successfully!');
    }
}
