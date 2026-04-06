<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Stall;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Imports\ContractsImport;
use Maatwebsite\Excel\Facades\Excel;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        // 🔥 CRUCIAL FIX: We MUST eager load 'payments' here so the Phase 2 Monthly Matrix 
        // doesn't cause an N+1 database crash when rendering the Treasury Ledger.
        $query = Contract::with(['tenant', 'stall.floor.building', 'payments']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';

            $query->whereHas('tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                    ->orWhere('last_name', 'like', $searchTerm);
            })
                ->orWhereHas('stall', function ($q) use ($searchTerm) {
                    $q->where('stall_code', 'like', $searchTerm);
                });
        }

        $contracts = $query->latest()->paginate(10)->withQueryString();
        $tenants = Tenant::orderBy('last_name', 'asc')->get();

        $availableStalls = Stall::with('floor.building')
            ->whereDoesntHave('contracts', function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('stall_code', 'asc')
            ->get();

        return Inertia::render('Contracts/Index', [
            'contracts' => $contracts,
            'tenants' => $tenants,
            'availableStalls' => $availableStalls,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'stall_id' => 'required|exists:stalls,id',
            'tenant_id' => 'required|exists:tenants,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'security_deposit' => 'nullable|numeric|min:0',

            // --- NEW PHASE 1 FIELDS ---
            'document_status' => 'nullable|string',
            'permit_status' => 'nullable|string',
            'deposit_paid' => 'nullable|numeric|min:0',
            'deposit_reference' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $validated['is_active'] = true;
        // If not provided from frontend, set defaults
        $validated['document_status'] = $validated['document_status'] ?? 'For Contract';
        $validated['permit_status'] = $validated['permit_status'] ?? 'Waiting';

        Contract::create($validated);

        return redirect()->back()->with('success', 'Contract drafted successfully!');
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'security_deposit' => 'nullable|numeric|min:0',

            // --- NEW PHASE 1 FIELDS ---
            'document_status' => 'nullable|string',
            'permit_status' => 'nullable|string',
            'deposit_paid' => 'nullable|numeric|min:0',
            'deposit_reference' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        $contract->update($validated);

        return redirect()->back()->with('success', 'Contract operations updated!');
    }

    public function destroy(Contract $contract)
    {
        DB::transaction(function () use ($contract) {
            \App\Models\Payment::where('contract_id', $contract->id)->delete();
            $contract->delete();
        });

        return redirect()->back()->with('success', 'Contract deleted. Stall is automatically Vacant.');
    }

    public function export()
    {
        // Add EEDO/Treasury fields to export if needed later
        $contracts = Contract::with(['stall', 'tenant'])->get();

        $csvData = "tenant_first_name,tenant_last_name,stall_code,start_date,end_date,monthly_rent,security_deposit\n";

        foreach ($contracts as $contract) {
            $tenantFirst = $contract->tenant ? '"' . str_replace('"', '""', $contract->tenant->first_name) . '"' : '""';
            $tenantLast = $contract->tenant ? '"' . str_replace('"', '""', $contract->tenant->last_name) . '"' : '""';
            $stallCode = $contract->stall ? '"' . str_replace('"', '""', $contract->stall->stall_code) . '"' : '""';

            $csvData .= "{$tenantFirst},{$tenantLast},{$stallCode},{$contract->start_date},{$contract->end_date},{$contract->monthly_rent},{$contract->security_deposit}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="contracts_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        try {
            Excel::import(new ContractsImport, $request->file('file'));
            return redirect()->back()->with('success', 'Contracts synced successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed.');
        }
    }
}