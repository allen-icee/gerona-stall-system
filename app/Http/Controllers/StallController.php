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
            'section' => 'nullable|string|max:255',
            'classification' => 'nullable|string|max:255',
            'size_sqm' => 'nullable|numeric|min:0',
            'stall_type' => 'required|string|in:sqm_based,class_based,manual',
            'rate_per_sqm' => 'nullable|numeric|min:0',
            'fixed_rate' => 'nullable|numeric|min:0',
        ]);

        $floor = Floor::findOrFail($validated['floor_id']);
        $validated['building_id'] = $floor->building_id;

        Stall::create($validated);

        return redirect()->back()->with('success', 'Stall successfully registered!');
    }

    public function update(Request $request, Stall $stall)
    {
        $validated = $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => 'required|string|max:255|unique:stalls,stall_code,' . $stall->id,
            'section' => 'nullable|string|max:255',
            'classification' => 'nullable|string|max:255',
            'size_sqm' => 'nullable|numeric|min:0',
            'stall_type' => 'required|string|in:sqm_based,class_based,manual',
            'rate_per_sqm' => 'nullable|numeric|min:0',
            'fixed_rate' => 'nullable|numeric|min:0',
        ]);

        $floor = Floor::findOrFail($validated['floor_id']);
        $validated['building_id'] = $floor->building_id;

        $stall->update($validated);

        return redirect()->back()->with('success', 'Stall details updated!');
    }

    public function destroy(Stall $stall)
    {
        DB::transaction(function () use ($stall) {
            \App\Models\Payment::where('stall_id', $stall->id)->delete();
            \App\Models\Contract::where('stall_id', $stall->id)->delete();
            $stall->delete();
        });

        return redirect()->back()->with('success', 'Stall and associated records successfully deleted.');
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
        $csvData = "stall_code,floor,stall_type,size_sqm,rate_per_sqm,fixed_rate\n";

        foreach ($stalls as $stall) {
            $floorName = $stall->floor ? $stall->floor->name : '';

            $code = '"' . str_replace('"', '""', $stall->stall_code) . '"';
            $floor = '"' . str_replace('"', '""', $floorName) . '"';
            $type = '"' . str_replace('"', '""', $stall->stall_type) . '"';
            $size = '"' . str_replace('"', '""', $stall->size_sqm ?? 0) . '"';
            $rate = '"' . str_replace('"', '""', $stall->rate_per_sqm ?? 0) . '"';
            $fixed = '"' . str_replace('"', '""', $stall->fixed_rate ?? 0) . '"';

            $csvData .= "{$code},{$floor},{$type},{$size},{$rate},{$fixed}\n";
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
            return redirect()->back()->with('success', 'Stalls synced successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed. Check column headers.');
        }
    }

    // 🔥 ADDED QUICK STATUS ROUTE LOGIC 🔥
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

        return redirect()->back()->with('success', "Stall securely updated to: " . strtoupper($status));
    }
}