<?php

namespace App\Http\Controllers;

use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Imports\BuildingsImport;
use Maatwebsite\Excel\Facades\Excel;

class BuildingController extends Controller
{
    public function index(Request $request)
    {
        $query = Building::withCount('floors');

        // Search Filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // 🔥 BULLETPROOF SORTING 🔥
        $allowedSorts = ['name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'name';

        // Force direction to be exactly 'desc' or 'asc' (ignores "undefined")
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        $query->orderBy($sortBy, $direction);

        $buildings = $query->paginate(10)->withQueryString();

        return Inertia::render('Buildings/Index', [
            'buildings' => $buildings,
            'filters' => $request->only(['search', 'sort', 'direction'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:buildings,name'
        ]);

        Building::create($validated);
        return redirect()->route('buildings.index')->with('success', 'Building created successfully.');
    }

    public function update(Request $request, Building $building)
    {
        $validated = $request->request->add(['name' => strtoupper($request->name)]); // Force uppercase
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:buildings,name,' . $building->id
        ]);

        $building->update($validated);
        return redirect()->route('buildings.index')->with('success', 'Building updated successfully.');
    }

    public function destroy(Building $building)
    {
        try {
            $building->delete();
            return redirect()->route('buildings.index')->with('success', 'Building deleted successfully.');
        } catch (\Illuminate\Database\QueryException $e) {
            return redirect()->route('buildings.index')->with('error', 'Action Denied: You cannot delete this building because it contains active floors.');
        }
    }

    public function export(Request $request)
    {
        $query = Building::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // 🔥 BULLETPROOF EXPORT SORTING 🔥
        $allowedSorts = ['name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'name';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        $query->orderBy($sortBy, $direction);

        $buildings = $query->get();
        $csvData = "name\n";

        foreach ($buildings as $building) {
            $name = '"' . str_replace('"', '""', $building->name) . '"';
            $csvData .= "{$name}\n";
        }
        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="filtered_buildings_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        Excel::import(new BuildingsImport, $request->file('file'));
        return redirect()->route('buildings.index')->with('success', 'Buildings imported successfully.');
    }
}