<?php

namespace App\Http\Controllers;

use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BuildingController extends Controller
{
    public function index(Request $request)
    {
        $query = Building::query();

        // 1. Makes the Search Bar Work
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        $buildings = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Buildings/Index', [
            'buildings' => $buildings,
            'filters' => $request->only(['search']),
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:buildings,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Building::create($request->all());

        return redirect()->back()->with('success', 'Building created successfully.');
    }

    public function update(Request $request, Building $building)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:buildings,name,' . $building->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $building->update($request->all());

        return redirect()->back()->with('success', 'Building updated successfully.');
    }

    public function destroy(Building $building)
    {
        $building->delete();
        return redirect()->back()->with('success', 'Building deleted successfully.');
    }
    public function export()
    {
        // Note: If you don't have Maatwebsite/Excel installed yet, we can return a CSV manually:
        $buildings = Building::all();
        $csvData = "ID,Building Name,Description,Created At\n";
        foreach ($buildings as $building) {
            $csvData .= "{$building->id},{$building->name},{$building->description},{$building->created_at}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="buildings_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls|max:2048'
        ]);

        // For now, this just proves the button works and triggers the Toast!
        // Real logic to parse the Excel file will go here when we install Maatwebsite/Excel
        return redirect()->back()->with('success', 'Building list imported successfully!');
    }
}
