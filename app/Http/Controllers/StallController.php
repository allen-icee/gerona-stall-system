<?php
//app\Http\Controllers\StallController.php
namespace App\Http\Controllers;

use App\Models\Stall;
use App\Models\Floor;
use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Imports\StallsImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Validation\Rule;

class StallController extends Controller
{
    public function index(Request $request)
    {
        $pricingFlag = DB::table('feature_flags')->where('name', 'use_proposed_pricing')->first();
        if (!$pricingFlag) {
            DB::table('feature_flags')->insert([
                'name' => 'use_proposed_pricing',
                'is_enabled' => false,
                'description' => 'Toggle between Current Rates (false) and Proposed Rates (true)'
            ]);
            $useProposedPricing = false;
        } else {
            $useProposedPricing = (bool) $pricingFlag->is_enabled;
        }

        // 🔥 FIXED: Changed 'activeContract' to 'activeContracts'
        $query = Stall::with(['floor.building', 'activeContracts']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('stall_code', 'like', $searchTerm)
                ->orWhereHas('floor', function ($q) use ($searchTerm) {
                    $q->where('name', 'like', $searchTerm)
                        ->orWhereHas('building', function ($q2) use ($searchTerm) {
                            $q2->where('name', 'like', $searchTerm);
                        });
                });
        }

        if ($request->filled('building_id')) {
            $query->whereHas('floor', function ($q) use ($request) {
                $q->where('building_id', $request->building_id);
            });
        }

        $allowedSorts = ['stall_code', 'location', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'stall_code';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';
        $isDesc = $direction === 'desc';

        if ($sortBy === 'created_at') {
            $query->orderBy('created_at', $direction);
        }

        $stallsCollection = $query->get();

        if ($sortBy === 'stall_code') {
            $stallsCollection = $stallsCollection->sort(function ($a, $b) use ($isDesc) {
                $cmp = strnatcasecmp($a->stall_code, $b->stall_code);
                return $isDesc ? -$cmp : $cmp;
            })->values();
        } elseif ($sortBy === 'location') {
            $stallsCollection = $stallsCollection->sort(function ($a, $b) use ($isDesc) {
                $locA = ($a->floor->building->name ?? '') . ($a->floor->name ?? '');
                $locB = ($b->floor->building->name ?? '') . ($b->floor->name ?? '');

                if ($locA === $locB) {
                    return strnatcasecmp($a->stall_code, $b->stall_code);
                }

                $cmp = strcmp($locA, $locB);
                return $isDesc ? -$cmp : $cmp;
            })->values();
        }

        $page = Paginator::resolveCurrentPage() ?: 1;
        $perPage = 15;
        $paginatedStalls = new LengthAwarePaginator(
            $stallsCollection->forPage($page, $perPage)->values(),
            $stallsCollection->count(),
            $perPage,
            $page,
            [
                'path' => Paginator::resolveCurrentPath(),
                'query' => $request->query()
            ]
        );

        $floors = Floor::with('building')->orderBy('name', 'asc')->get();
        $buildings = Building::orderBy('name')->get();

        return Inertia::render('Stalls/Index', [
            'stalls' => $paginatedStalls,
            'floors' => $floors,
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'sort', 'direction', 'building_id']),
            'useProposedPricing' => $useProposedPricing,
        ]);
    }

    public function store(Request $request)
    {
        $floor = Floor::findOrFail($request->floor_id);

        $validated = $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('stalls', 'stall_code')->where('floor_id', $request->floor_id)
            ],
            'size_sqm' => 'nullable|numeric|min:0',
            'current_monthly_rental' => 'nullable|numeric|min:0',
            'current_rate_per_sqm' => 'nullable|numeric|min:0',
            'proposed_monthly_rental' => 'nullable|numeric|min:0',
            'proposed_rate_per_sqm' => 'nullable|numeric|min:0',
        ]);

        $validated['size_sqm'] = $validated['size_sqm'] ?? 0;
        $validated['current_monthly_rental'] = round($validated['current_monthly_rental'] ?? 0);
        $validated['current_rate_per_sqm'] = round($validated['current_rate_per_sqm'] ?? 0);
        $validated['proposed_monthly_rental'] = round($validated['proposed_monthly_rental'] ?? 0);
        $validated['proposed_rate_per_sqm'] = round($validated['proposed_rate_per_sqm'] ?? 0);

        $validated['building_id'] = $floor->building_id;

        Stall::create($validated);

        return redirect()->back()->with('message', 'Stall successfully registered!');
    }

    public function update(Request $request, Stall $stall)
    {
        $floor = Floor::findOrFail($request->floor_id);

        $validated = $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('stalls', 'stall_code')
                    ->where('floor_id', $request->floor_id)
                    ->ignore($stall->id)
            ],
            'size_sqm' => 'nullable|numeric|min:0',
            'current_monthly_rental' => 'nullable|numeric|min:0',
            'current_rate_per_sqm' => 'nullable|numeric|min:0',
            'proposed_monthly_rental' => 'nullable|numeric|min:0',
            'proposed_rate_per_sqm' => 'nullable|numeric|min:0',
        ]);

        $validated['size_sqm'] = $validated['size_sqm'] ?? 0;
        $validated['current_monthly_rental'] = round($validated['current_monthly_rental'] ?? 0);
        $validated['current_rate_per_sqm'] = round($validated['current_rate_per_sqm'] ?? 0);
        $validated['proposed_monthly_rental'] = round($validated['proposed_monthly_rental'] ?? 0);
        $validated['proposed_rate_per_sqm'] = round($validated['proposed_rate_per_sqm'] ?? 0);

        $validated['building_id'] = $floor->building_id;

        $stall->update($validated);

        return redirect()->back()->with('message', 'Stall details updated!');
    }

    public function destroy(Stall $stall)
    {
        DB::transaction(function () use ($stall) {
            $contractIds = \App\Models\Contract::where('stall_id', $stall->id)->pluck('id');
            if ($contractIds->isNotEmpty()) {
                \App\Models\Payment::whereIn('contract_id', $contractIds)->delete();
            }
            \App\Models\Contract::where('stall_id', $stall->id)->delete();
            $stall->delete();
        });

        return redirect()->back()->with('message', 'Stall and associated records successfully deleted.');
    }

    public function export(Request $request)
    {
        $query = Stall::with(['floor.building']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('stall_code', 'like', $searchTerm)
                ->orWhereHas('floor', function ($q) use ($searchTerm) {
                    $q->where('name', 'like', $searchTerm)
                        ->orWhereHas('building', function ($q2) use ($searchTerm) {
                            $q2->where('name', 'like', $searchTerm);
                        });
                });
        }

        if ($request->filled('building_id')) {
            $query->whereHas('floor', function ($q) use ($request) {
                $q->where('building_id', $request->building_id);
            });
        }

        $allowedSorts = ['stall_code', 'location', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'stall_code';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';
        $isDesc = $direction === 'desc';

        if ($sortBy === 'created_at') {
            $query->orderBy('created_at', $direction);
        }

        $stallsCollection = $query->get();

        if ($sortBy === 'stall_code') {
            $stallsCollection = $stallsCollection->sort(function ($a, $b) use ($isDesc) {
                $cmp = strnatcasecmp($a->stall_code, $b->stall_code);
                return $isDesc ? -$cmp : $cmp;
            })->values();
        } elseif ($sortBy === 'location') {
            $stallsCollection = $stallsCollection->sort(function ($a, $b) use ($isDesc) {
                $locA = ($a->floor->building->name ?? '') . ($a->floor->name ?? '');
                $locB = ($b->floor->building->name ?? '') . ($b->floor->name ?? '');

                if ($locA === $locB) {
                    return strnatcasecmp($a->stall_code, $b->stall_code);
                }

                $cmp = strcmp($locA, $locB);
                return $isDesc ? -$cmp : $cmp;
            })->values();
        }

        $exportData = [];
        foreach ($stallsCollection as $stall) {
            $exportData[] = [
                'building_name' => $stall->floor && $stall->floor->building ? $stall->floor->building->name : 'Unassigned',
                'floor_or_section_name' => $stall->floor ? $stall->floor->name : 'Unassigned',
                'stall_code' => $stall->stall_code,
                'size_sqm' => $stall->size_sqm ?? 0,
                'current_monthly_rental' => $stall->current_monthly_rental ?? 0,
                'current_rate_per_sqm' => $stall->current_rate_per_sqm ?? 0,
                'proposed_monthly_rental' => $stall->proposed_monthly_rental ?? 0,
                'proposed_rate_per_sqm' => $stall->proposed_rate_per_sqm ?? 0,
            ];
        }

        $export = new class ($exportData) implements \Maatwebsite\Excel\Concerns\FromArray, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\ShouldAutoSize {
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
                'building_name',
                'floor_or_section_name',
                'stall_code',
                'size_sqm',
                'current_monthly_rental',
                'current_rate_per_sqm',
                'proposed_monthly_rental',
                'proposed_rate_per_sqm'
                ];
            }
        };

        $filename = 'stalls_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);

        try {
            Excel::import(new StallsImport, $request->file('file'));
            return redirect()->back()->with('message', 'Stalls synced successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import Error: ' . $e->getMessage());
        }
    }

    public function quickStatus(Request $request, Stall $stall)
    {
        $validated = $request->validate([
            'status' => 'required|in:vacant,closed,maintenance,signed,for_contract,for_signing,waiting_permit,on_process,confirm_permit',
        ]);

        $status = $validated['status'];

        DB::transaction(function () use ($stall, $status) {
            $activeContract = \App\Models\Contract::where('stall_id', $stall->id)->where('is_active', true)->first();

            if ($status === 'vacant') {
                if ($activeContract) {
                    $activeContract->update([
                        'is_active' => false,
                        'remarks' => 'System Auto-Closed: Marked Vacant via Quick Paint Map Tool'
                    ]);
                }
                $stall->update(['status' => 'Vacant']);
            } elseif ($status === 'closed') {
                $stall->update(['status' => 'Closed']);
            } elseif ($status === 'maintenance') {
                $stall->update(['status' => 'Under Maintenance']);
            } elseif ($activeContract) {
                $stall->update(['status' => 'Occupied']);

                switch ($status) {
                    case 'signed':
                        $activeContract->update(['document_status' => 'Signed']);
                        break;
                    case 'for_contract':
                        $activeContract->update(['document_status' => 'For Contract']);
                        break;
                    case 'for_signing':
                        $activeContract->update(['document_status' => 'For Signing']);
                        break;
                    case 'waiting_permit':
                        $activeContract->update(['permit_status' => 'Waiting']);
                        break;
                    case 'on_process':
                        $activeContract->update(['permit_status' => 'On Process']);
                        break;
                    case 'confirm_permit':
                        $activeContract->update(['permit_status' => 'Issued']);
                        break;
                }
            }
        });

        return redirect()->back()->with('success', "Status successfully updated via Quick Paint!");
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:stalls,id',
            'size_sqm' => 'nullable|numeric|min:0',
            'current_monthly_rental' => 'nullable|numeric|min:0',
            'current_rate_per_sqm' => 'nullable|numeric|min:0',
            'proposed_monthly_rental' => 'nullable|numeric|min:0',
            'proposed_rate_per_sqm' => 'nullable|numeric|min:0',
        ]);

        $updateData = [];
        $fields = ['size_sqm', 'current_monthly_rental', 'current_rate_per_sqm', 'proposed_monthly_rental', 'proposed_rate_per_sqm'];

        foreach ($fields as $field) {
            if ($request->filled($field)) {
                if ($field !== 'size_sqm') {
                    $updateData[$field] = round($request->input($field));
                } else {
                    $updateData[$field] = $request->input($field);
                }
            }
        }

        if (!empty($updateData)) {
            Stall::whereIn('id', $request->ids)->update($updateData);
        }

        return redirect()->back()->with('message', count($request->ids) . ' stalls successfully updated.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:stalls,id',
        ]);

        DB::transaction(function () use ($request) {
            $contractIds = \App\Models\Contract::whereIn('stall_id', $request->ids)->pluck('id');
            if ($contractIds->isNotEmpty()) {
                \App\Models\Payment::whereIn('contract_id', $contractIds)->delete();
            }
            \App\Models\Contract::whereIn('stall_id', $request->ids)->delete();
            Stall::whereIn('id', $request->ids)->delete();
        });

        return redirect()->back()->with('message', 'Selected stalls and associated records deleted.');
    }

    public function togglePricing()
    {
        $flag = DB::table('feature_flags')->where('name', 'use_proposed_pricing')->first();

        if ($flag) {
            DB::table('feature_flags')
                ->where('name', 'use_proposed_pricing')
                ->update(['is_enabled' => !$flag->is_enabled]);
        } else {
            DB::table('feature_flags')->insert([
                'name' => 'use_proposed_pricing',
                'is_enabled' => true,
                'description' => 'Toggle between Current Rates (false) and Proposed Rates (true)'
            ]);
        }

        return redirect()->back()->with('message', 'Global Pricing Rule Updated!');
    }
}
