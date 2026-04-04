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
        $query = Contract::with(['tenant', 'stall.floor.building']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('contract_number', 'like', $searchTerm)
                ->orWhereHas('tenant', function ($q) use ($searchTerm) {
                    $q->where('first_name', 'like', $searchTerm)
                        ->orWhere('last_name', 'like', $searchTerm);
                })
                ->orWhereHas('stall', function ($q) use ($searchTerm) {
                    $q->where('stall_code', 'like', $searchTerm);
                });
        }

        // Gold Standard: Alphabetically sorted by contract_number
        $contracts = $query->orderBy('contract_number', 'asc')->paginate(10)->withQueryString();
        $tenants = Tenant::orderBy('last_name', 'asc')->get();

        // Fetch stalls that DO NOT have an active contract, meaning they are VACANT!
        $availableStalls = Stall::with('floor.building')
            ->whereDoesntHave('activeContract')
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
        ]);

        // Automatically assign default lifecycle statuses if not provided
        $validated['is_active'] = true;
        $validated['permit_status'] = 'PENDING';

        // Notice: No manual stall status_id updating needed anymore! Dynamic Computed Status handles it.
        Contract::create($validated);

        return redirect()->back()->with('success', 'Contract created successfully!');
    }

    public function update(Request $request, Contract $contract)
    {
        // For safety, only allow updating dates and fees on an active contract.
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'security_deposit' => 'nullable|numeric|min:0',
        ]);

        $contract->update($validated);

        return redirect()->back()->with('success', 'Contract details updated!');
    }

    public function destroy(Contract $contract)
    {
        // Gold Standard: Transaction safely deletes children before the parent
        DB::transaction(function () use ($contract) {
            // Delete all payments specifically linked to THIS contract first
            \App\Models\Payment::where('contract_id', $contract->id)->delete();

            // Notice: No manual stall status_id reverting needed! Dynamic Computed Status handles it.
            $contract->delete();
        });

        return redirect()->back()->with('success', 'Contract deleted. Stall is automatically Vacant.');
    }

    public function export()
    {
        $contracts = Contract::with(['stall', 'tenant'])->orderBy('contract_number', 'asc')->get();

        // Exact headers for foolproof importing
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
            return redirect()->back()->with('error', 'Import failed. Ensure columns are exactly: "tenant_first_name", "tenant_last_name", "stall_code", "start_date", "end_date", "monthly_rent", "security_deposit".');
        }
    }
}
