<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Contract;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index()
    {
        // Load the payment ledger
        $payments = Payment::with(['stall.building', 'tenant', 'encoder'])->latest()->paginate(15);

        // Load active contracts for the dropdown
        $activeContracts = Contract::with(['stall.building', 'tenant'])->get();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'activeContracts' => $activeContracts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id', // Virtual field to pull stall/tenant
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'month' => 'required|string|max:20',
            'year' => 'required|integer|min:2000',
            'or_number' => 'required|string|unique:payments,or_number',
        ]);

        // Find the contract to get the exact Stall and Tenant IDs
        $contract = Contract::findOrFail($validated['contract_id']);

        Payment::create([
            'stall_id' => $contract->stall_id,
            'tenant_id' => $contract->tenant_id,
            'amount' => $validated['amount'],
            'payment_date' => $validated['payment_date'],
            'month' => $validated['month'],
            'year' => $validated['year'],
            'or_number' => $validated['or_number'],
            'encoded_by' => Auth::id(), // Automatically logs whoever is clicking the save button!
        ]);

        return redirect()->back()->with('success', 'Official Receipt (OR) successfully recorded!');
    }
}
