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
    public function index()
    {
        // Load contracts with their associated tenants and stalls
        $contracts = Contract::with(['stall.building', 'tenant'])->latest()->paginate(10);

        $tenants = Tenant::orderBy('last_name')->get();

        // STRICT EXCEL RULE: Only fetch stalls that are currently 'VACANT'
        $vacantStatus = Status::where('name', 'VACANT')->first();
        $availableStalls = Stall::with('building')->where('status_id', $vacantStatus?->id)->get();

        return Inertia::render('Contracts/Index', [
            'contracts' => $contracts,
            'tenants' => $tenants,
            'availableStalls' => $availableStalls,
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

        // Wrap in a transaction so if one fails, it rolls back everything
        DB::transaction(function () use ($validated) {
            // 1. Create the lease agreement
            Contract::create($validated);

            // 2. Automatically update the Stall's status to the official Excel signed status
            $stall = Stall::find($validated['stall_id']);
            $signedStatus = Status::where('name', 'COMPLETE REQUIREMENTS - Signed contract')->first();

            if ($signedStatus) {
                $stall->update(['status_id' => $signedStatus->id]);
            }
        });

        return redirect()->back()->with('success', 'Contract successfully created! The stall status has been updated on the map.');
    }
}
