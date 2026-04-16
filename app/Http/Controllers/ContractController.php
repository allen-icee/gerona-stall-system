<?php
//app\Http\Controllers\ContractController.php
namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Stall;
use App\Models\Tenant;
use App\Models\Building;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Imports\ContractsImport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $query = Contract::with(['tenant', 'stall.floor.building', 'payments']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->whereHas('tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                    ->orWhere('last_name', 'like', $searchTerm);
            })->orWhereHas('stall', function ($q) use ($searchTerm) {
                $q->where('stall_code', 'like', $searchTerm);
            });
        }

        if ($request->filled('building_id')) {
            $query->whereHas('stall.floor', function ($q) use ($request) {
                $q->where('building_id', $request->building_id);
            });
        }

        if ($request->filled('month')) {
            $query->whereMonth('start_date', $request->month);
        }
        if ($request->filled('year')) {
            $query->whereYear('start_date', $request->year);
        }

        $allowedSorts = ['tenant_name', 'stall_code', 'start_date', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'created_at';
        $direction = strtolower($request->input('direction')) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'tenant_name') {
            $query->join('tenants', 'contracts.tenant_id', '=', 'tenants.id')
                ->select('contracts.*')
                ->orderBy('tenants.last_name', $direction);
        } elseif ($sortBy === 'stall_code') {
            $query->join('stalls', 'contracts.stall_id', '=', 'stalls.id')
                ->select('contracts.*')
                ->orderBy('stalls.stall_code', $direction);
        } else {
            $query->orderBy('contracts.' . $sortBy, $direction);
        }

        $contracts = $query->paginate(10)->withQueryString();
        $tenants = Tenant::orderBy('last_name', 'asc')->get();
        $buildings = Building::orderBy('name', 'asc')->get();

        $availableStalls = Stall::with('floor.building')
            ->whereDoesntHave('contracts', function ($q) {
                $q->where('is_active', true);
            })->orderBy('stall_code', 'asc')->get();

        return Inertia::render('Contracts/Index', [
            'contracts' => $contracts,
            'tenants' => $tenants,
            'availableStalls' => $availableStalls,
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'sort', 'direction', 'building_id', 'month', 'year']),
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
            'deposit_required' => 'nullable|numeric|min:0',
            'document_status' => 'nullable|string',
            'permit_status' => 'nullable|string',
            'deposit_paid' => 'nullable|numeric|min:0',
            'deposit_reference' => 'nullable|string',
            'remarks' => 'nullable|string',
            'is_renewal' => 'nullable|boolean',
            'old_contract_id' => 'nullable|exists:contracts,id'
        ]);

        $validated['is_active'] = true;
        $validated['document_status'] = $validated['document_status'] ?? 'For Contract';
        $validated['permit_status'] = $validated['permit_status'] ?? 'Waiting';

        DB::transaction(function () use ($validated, $request) {

            $depositPaid = $validated['deposit_paid'] ?? null;
            $depositRef = $validated['deposit_reference'] ?? null;
            unset($validated['deposit_paid'], $validated['deposit_reference']);

            if ($request->boolean('is_renewal') && $request->filled('old_contract_id')) {
                $oldContract = Contract::find($request->old_contract_id);
                $gracePeriodEnds = Carbon::parse($oldContract->end_date)->addHours(24);

                if (now()->greaterThan($gracePeriodEnds)) {
                    $validated['monthly_rent'] = $validated['monthly_rent'] * 1.20; // 20% Penalty Note
                    $validated['remarks'] = ($validated['remarks'] ?? '') . ' [SYSTEM: 20% Late Renewal Penalty Applied]';
                }

                $oldContract->update([
                    'is_active' => false,
                    'permit_status' => 'Closed',
                    'document_status' => 'Archived'
                ]);
            }

            unset($validated['is_renewal'], $validated['old_contract_id']);

            $contract = Contract::create($validated);

            if ($depositPaid > 0) {
                Payment::create([
                    'contract_id' => $contract->id,
                    'amount' => $depositPaid,
                    'payment_date' => now(),
                    'payment_type' => 'deposit',
                    'or_number' => $depositRef ?? 'SYS-DEP-' . strtoupper(uniqid()),
                    'encoded_by' => Auth::id() ?? 1,
                ]);
            }
        });

        $msg = $request->boolean('is_renewal') ? 'Contract renewed! Old contract archived.' : 'Contract drafted successfully!';
        return redirect()->back()->with('success', $msg);
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'monthly_rent' => 'required|numeric|min:0',
            'deposit_required' => 'nullable|numeric|min:0',
            'document_status' => 'nullable|string',
            'permit_status' => 'nullable|string',
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

    public function export(Request $request)
    {
        $query = Contract::with(['stall', 'tenant']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->whereHas('tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)->orWhere('last_name', 'like', $searchTerm);
            })->orWhereHas('stall', function ($q) use ($searchTerm) {
                $q->where('stall_code', 'like', $searchTerm);
            });
        }

        if ($request->filled('building_id')) {
            $query->whereHas('stall.floor', function ($q) use ($request) {
                $q->where('building_id', $request->building_id);
            });
        }
        if ($request->filled('month')) {
            $query->whereMonth('start_date', $request->month);
        }
        if ($request->filled('year')) {
            $query->whereYear('start_date', $request->year);
        }

        $allowedSorts = ['tenant_name', 'stall_code', 'start_date', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'created_at';
        $direction = strtolower($request->input('direction')) === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'tenant_name') {
            $query->join('tenants', 'contracts.tenant_id', '=', 'tenants.id')->select('contracts.*')->orderBy('tenants.last_name', $direction);
        } elseif ($sortBy === 'stall_code') {
            $query->join('stalls', 'contracts.stall_id', '=', 'stalls.id')->select('contracts.*')->orderBy('stalls.stall_code', $direction);
        } else {
            $query->orderBy('contracts.' . $sortBy, $direction);
        }

        $contracts = $query->get();

        $exportData = [];
        foreach ($contracts as $contract) {
            $exportData[] = [
                'tenant_first_name' => $contract->tenant->first_name ?? '',
                'tenant_last_name' => $contract->tenant->last_name ?? '',
                'stall_code' => $contract->stall->stall_code ?? '',
                'start_date' => $contract->start_date,
                'end_date' => $contract->end_date,
                'monthly_rent' => $contract->monthly_rent,
                'deposit_required' => $contract->deposit_required ?? 0,
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
                    'tenant_first_name',
                    'tenant_last_name',
                    'stall_code',
                    'start_date',
                    'end_date',
                    'monthly_rent',
                    'deposit_required'
                ];
            }
        };

        $filename = 'contracts_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
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
