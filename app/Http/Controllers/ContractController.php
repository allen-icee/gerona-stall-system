<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Stall;
use App\Models\Tenant;
use App\Models\Status;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $query = Contract::with(['stall.building', 'tenant']);

        // Debounced Search Logic
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->whereHas('tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                    ->orWhere('last_name', 'like', $searchTerm)
                    ->orWhere('company_name', 'like', $searchTerm);
            })->orWhereHas('stall', function ($q) use ($searchTerm) {
                $q->where('stall_code', 'like', $searchTerm);
            });
        }

        $contracts = $query->latest()->paginate(10)->withQueryString();
        $tenants = Tenant::orderBy('last_name')->get();

        // STRICT EXCEL RULE: Only fetch stalls that are currently 'VACANT'
        $vacantStatus = Status::where('name', 'VACANT')->first();
        $availableStalls = Stall::with('building')->where('status_id', $vacantStatus?->id)->get();

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

        DB::transaction(function () use ($validated) {
            Contract::create($validated);

            $stall = Stall::find($validated['stall_id']);
            $signedStatus = Status::where('name', 'COMPLETE REQUIREMENTS - Signed contract')->first();

            if ($signedStatus && $stall) {
                $stall->update(['status_id' => $signedStatus->id]);
            }
        });

        return redirect()->back()->with('success', 'Contract created and stall marked as Signed!');
    }

    public function update(Request $request, Contract $contract)
    {
        // For safety, we only allow updating dates and fees on an active contract.
        // Changing a tenant or stall requires creating a new contract.
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
        DB::transaction(function () use ($contract) {
            // Revert the stall back to VACANT
            $stall = Stall::find($contract->stall_id);
            $vacantStatus = Status::where('name', 'VACANT')->first();

            if ($stall && $vacantStatus) {
                $stall->update(['status_id' => $vacantStatus->id]);
            }

            // Delete the contract
            $contract->delete();
        });

        return redirect()->back()->with('success', 'Contract deleted. Stall is now Vacant.');
    }

    public function export()
    {
        $contracts = Contract::with(['stall', 'tenant'])->get();
        $csvData = "ID,Tenant,Stall,Start Date,End Date,Monthly Rent,Deposit\n";
        foreach ($contracts as $contract) {
            $tenantName = $contract->tenant ? $contract->tenant->first_name . ' ' . $contract->tenant->last_name : 'N/A';
            $stallCode = $contract->stall ? $contract->stall->stall_code : 'N/A';
            $csvData .= "{$contract->id},{$tenantName},{$stallCode},{$contract->start_date},{$contract->end_date},{$contract->monthly_rent},{$contract->security_deposit}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="contracts_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        return redirect()->back()->with('success', 'Contracts imported successfully!');
    }
}
