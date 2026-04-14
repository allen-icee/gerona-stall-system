<?php

namespace App\Http\Controllers;

use App\Models\Stall;
use App\Models\Floor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Imports\StallsImport;
use Maatwebsite\Excel\Facades\Excel;

class StallController extends Controller
{
    public function index(Request $request)
    {
        $query = Stall::with(['floor.building', 'activeContract']);

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

        $allowedSorts = ['stall_code', 'location', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'stall_code';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'location') {
            $query->join('floors', 'stalls.floor_id', '=', 'floors.id')
                ->join('buildings', 'floors.building_id', '=', 'buildings.id')
                ->select('stalls.*')
                ->orderBy('buildings.name', $direction)
                ->orderBy('floors.name', $direction)
                ->orderBy('stalls.stall_code', 'asc');
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $stalls = $query->paginate(15)->withQueryString();
        $floors = Floor::with('building')->orderBy('name', 'asc')->get();

        return Inertia::render('Stalls/Index', [
            'stalls' => $stalls,
            'floors' => $floors,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => 'required|string|max:255|unique:stalls,stall_code',
            'size_sqm' => 'nullable|numeric|min:0',
            'current_monthly_rental' => 'nullable|numeric|min:0',
            'current_rate_per_sqm' => 'nullable|numeric|min:0',
            'proposed_monthly_rental' => 'nullable|numeric|min:0',
            'proposed_rate_per_sqm' => 'nullable|numeric|min:0',
        ]);

        // 🔥 LGU RULE: Round all currency to the nearest whole peso, default to 0
        $validated['size_sqm'] = $validated['size_sqm'] ?? 0;
        $validated['current_monthly_rental'] = round($validated['current_monthly_rental'] ?? 0);
        $validated['current_rate_per_sqm'] = round($validated['current_rate_per_sqm'] ?? 0);
        $validated['proposed_monthly_rental'] = round($validated['proposed_monthly_rental'] ?? 0);
        $validated['proposed_rate_per_sqm'] = round($validated['proposed_rate_per_sqm'] ?? 0);

        $floor = Floor::findOrFail($validated['floor_id']);
        $validated['building_id'] = $floor->building_id;

        Stall::create($validated);

        return redirect()->back()->with('message', 'Stall successfully registered!');
    }

    public function update(Request $request, Stall $stall)
    {
        $validated = $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => 'required|string|max:255|unique:stalls,stall_code,' . $stall->id,
            'size_sqm' => 'nullable|numeric|min:0',
            'current_monthly_rental' => 'nullable|numeric|min:0',
            'current_rate_per_sqm' => 'nullable|numeric|min:0',
            'proposed_monthly_rental' => 'nullable|numeric|min:0',
            'proposed_rate_per_sqm' => 'nullable|numeric|min:0',
        ]);

        // 🔥 LGU RULE: Round all currency to the nearest whole peso
        $validated['size_sqm'] = $validated['size_sqm'] ?? 0;
        $validated['current_monthly_rental'] = round($validated['current_monthly_rental'] ?? 0);
        $validated['current_rate_per_sqm'] = round($validated['current_rate_per_sqm'] ?? 0);
        $validated['proposed_monthly_rental'] = round($validated['proposed_monthly_rental'] ?? 0);
        $validated['proposed_rate_per_sqm'] = round($validated['proposed_rate_per_sqm'] ?? 0);

        $floor = Floor::findOrFail($validated['floor_id']);
        $validated['building_id'] = $floor->building_id;

        $stall->update($validated);

        return redirect()->back()->with('message', 'Stall details updated!');
    }

    public function destroy(Stall $stall)
    {
        DB::transaction(function () use ($stall) {
            // 1. Get all contract IDs for this stall
            $contractIds = \App\Models\Contract::where('stall_id', $stall->id)->pluck('id');

            // 2. Delete all payments linked to those contracts
            if ($contractIds->isNotEmpty()) {
                \App\Models\Payment::whereIn('contract_id', $contractIds)->delete();
            }

            // 3. Delete the contracts
            \App\Models\Contract::where('stall_id', $stall->id)->delete();

            // 4. Finally, delete the physical stall
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

        $allowedSorts = ['stall_code', 'location', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'stall_code';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'location') {
            $query->join('floors', 'stalls.floor_id', '=', 'floors.id')
                ->join('buildings', 'floors.building_id', '=', 'buildings.id')
                ->select('stalls.*')
                ->orderBy('buildings.name', $direction)
                ->orderBy('floors.name', $direction)
                ->orderBy('stalls.stall_code', 'asc');
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $stalls = $query->get();

        // Updated CSV Headers for the LGU data
        $csvData = "stall_code,floor,size_sqm,current_monthly_rental,current_rate_per_sqm,proposed_monthly_rental,proposed_rate_per_sqm\n";

        foreach ($stalls as $stall) {
            $floorName = $stall->floor ? $stall->floor->name : '';

            $code = '"' . str_replace('"', '""', $stall->stall_code) . '"';
            $floor = '"' . str_replace('"', '""', $floorName) . '"';
            $size = '"' . str_replace('"', '""', $stall->size_sqm ?? 0) . '"';
            $curr_rent = '"' . str_replace('"', '""', $stall->current_monthly_rental ?? 0) . '"';
            $curr_rate = '"' . str_replace('"', '""', $stall->current_rate_per_sqm ?? 0) . '"';
            $prop_rent = '"' . str_replace('"', '""', $stall->proposed_monthly_rental ?? 0) . '"';
            $prop_rate = '"' . str_replace('"', '""', $stall->proposed_rate_per_sqm ?? 0) . '"';

            $csvData .= "{$code},{$floor},{$size},{$curr_rent},{$curr_rate},{$prop_rent},{$prop_rate}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="filtered_stalls_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);

        try {
            Excel::import(new StallsImport, $request->file('file'));
            return redirect()->back()->with('message', 'Stalls synced successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed. Check column headers.');
        }
    }

    public function quickStatus(Request $request, Stall $stall)
    {
        $status = $request->input('status');

        DB::transaction(function () use ($stall, $status) {
            if ($status === 'vacant') {
                // Wipe tenant data / Deactivate contract
                \App\Models\Contract::where('stall_id', $stall->id)
                    ->where('is_active', true)
                    ->update([
                        'is_active' => false,
                        'remarks' => 'System Auto-Closed: Marked Vacant via Quick Paint Map Tool'
                    ]);

                // Clear the stall's internal status
                $stall->update(['status' => 'Vacant']);
            } else {
                // Apply 'Under Maintenance' or 'Closed'
                $formattedStatus = $status === 'maintenance' ? 'Under Maintenance' : ucfirst($status);
                $stall->update(['status' => $formattedStatus]);
            }
        });

        return redirect()->back()->with('message', "Stall securely updated to: " . strtoupper($status));
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate(['ids' => 'required|array']);

        $updateData = [];
        $fields = ['size_sqm', 'current_monthly_rental', 'current_rate_per_sqm', 'proposed_monthly_rental', 'proposed_rate_per_sqm'];

        foreach ($fields as $field) {
            if ($request->filled($field)) {
                // If it's a currency field, apply the LGU rounding rule during bulk update
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
        $request->validate(['ids' => 'required|array']);

        DB::transaction(function () use ($request) {
            // 1. Get all contract IDs for ALL selected stalls
            $contractIds = \App\Models\Contract::whereIn('stall_id', $request->ids)->pluck('id');

            // 2. Delete all payments linked to those contracts
            if ($contractIds->isNotEmpty()) {
                \App\Models\Payment::whereIn('contract_id', $contractIds)->delete();
            }

            // 3. Delete the contracts
            \App\Models\Contract::whereIn('stall_id', $request->ids)->delete();

            // 4. Finally, mass delete the physical stalls
            Stall::whereIn('id', $request->ids)->delete();
        });

        return redirect()->back()->with('message', 'Selected stalls and associated records deleted.');
    }
}