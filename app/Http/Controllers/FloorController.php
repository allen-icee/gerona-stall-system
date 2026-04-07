<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Imports\FloorsImport;
use Maatwebsite\Excel\Facades\Excel;

class FloorController extends Controller
{
    public function index(Request $request)
    {
        $query = Floor::with('building')->withCount('stalls');

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('building', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        // 🔥 100% BULLETPROOF SORTING 🔥
        // Only allow these exact strings. If it's anything else (like "[native code]"), fallback to 'building'
        $allowedSorts = ['building', 'name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'building';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'building') {
            $query->orderBy(Building::select('name')->whereColumn('buildings.id', 'floors.building_id'), $direction)
                ->orderBy('name', 'asc');
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $floors = $query->paginate(10)->withQueryString();
        $buildings = Building::orderBy('name')->get();

        return Inertia::render('Floors/Index', [
            'floors' => $floors,
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'name' => 'required|string|max:50',
            'description' => 'nullable|string|max:1000'
        ]);
        Floor::create($validated);
        return redirect()->back()->with('success', 'Floor created successfully.');
    }

    public function update(Request $request, Floor $floor)
    {
        $validated = $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'name' => 'required|string|max:50',
            'description' => 'nullable|string|max:1000'
        ]);
        $floor->update($validated);
        return redirect()->back()->with('success', 'Floor updated successfully.');
    }

    public function destroy(Floor $floor)
    {
        try {
            $floor->delete();
            return redirect()->back()->with('success', 'Floor deleted successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->back()->with('error', 'Action Denied: You cannot delete this floor because it contains active stalls. Please delete or move the stalls first.');
        }
    }

    public function export(Request $request)
    {
        $query = Floor::with('building');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('building', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        // 🔥 BULLETPROOF EXPORT SORTING 🔥
        $allowedSorts = ['building', 'name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'building';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'building') {
            $query->orderBy(Building::select('name')->whereColumn('buildings.id', 'floors.building_id'), $direction)->orderBy('name', 'asc');
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $floors = $query->get();
        $csvData = "building_name,name,description\n";

        foreach ($floors as $floor) {
            $bName = '"' . str_replace('"', '""', $floor->building->name ?? '') . '"';
            $fName = '"' . str_replace('"', '""', $floor->name) . '"';
            $desc = '"' . str_replace('"', '""', $floor->description ?? '') . '"';
            $csvData .= "{$bName},{$fName},{$desc}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="filtered_floors_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        Excel::import(new FloorsImport, $request->file('file'));
        return redirect()->back()->with('success', 'Floors imported successfully.');
    }
}