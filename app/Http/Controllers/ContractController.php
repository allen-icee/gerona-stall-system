<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Stall;
use App\Models\Tenant;
use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Imports\ContractsImport;
use Maatwebsite\Excel\Facades\Excel;

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
            'stalls_count' => Stall::count(),
            'tenants_count' => Tenant::count(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'stall_id' => 'required|exists:stalls,id',
            'tenant_id' => 'required|exists:tenants,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'due_day' => 'required|integer|in:15,31',
            'monthly_rent' => 'required|numeric|min:0',
        ]);

        $validated['is_active'] = true;
        Contract::create($validated);

        return redirect()->back()->with('success', 'Tenant assigned to stall successfully!');
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'due_day' => 'required|integer|in:15,31',
            'monthly_rent' => 'required|numeric|min:0',
        ]);

        $contract->update($validated);
        return redirect()->back()->with('success', 'Stall assignment updated!');
    }

    public function destroy(Contract $contract)
    {
        $contract->delete();
        return redirect()->back()->with('success', 'Assignment removed. Stall is automatically Vacant.');
    }

    public function export(Request $request)
    {
        $contracts = Contract::with(['stall', 'tenant'])->get();
        $exportData = [];

        foreach ($contracts as $contract) {
            $exportData[] = [
                'tenant_first_name' => $contract->tenant->first_name ?? '',
                'tenant_last_name' => $contract->tenant->last_name ?? '',
                'stall_code' => $contract->stall->stall_code ?? '',
                'start_date' => $contract->start_date,
                'end_date' => $contract->end_date,
                'due_day' => $contract->due_day,
                'monthly_rent' => $contract->monthly_rent,
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
                return ['First Name', 'Last Name', 'Stall Code', 'Start Date', 'End Date', 'Due Day', 'Monthly Rent'];
            }
        };

        $filename = 'stall_assignments_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        try {
            Excel::import(new ContractsImport, $request->file('file'));
            return redirect()->back()->with('success', 'Assignments synced successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed.');
        }
    }
}
