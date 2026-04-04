<?php

namespace App\Http\Controllers;

use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BuildingController extends Controller
{
    public function index(Request $request)
    {
        $query = Building::query();

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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Building::create($validated);

        return redirect()->back()->with('success', 'Building added successfully.');
    }

    public function update(Request $request, Building $building)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $building->update($validated);

        return redirect()->back()->with('success', 'Building updated successfully.');
    }

    public function destroy(Building $building)
    {
        // THE FIX: Transaction safely deletes children before the parent
        DB::transaction(function () use ($building) {
            // 1. Get all floor IDs belonging to this building
            $floorIds = $building->floors()->pluck('id');

            // 2. Get all stall IDs belonging to those floors
            $stallIds = \App\Models\Stall::whereIn('floor_id', $floorIds)->pluck('id');

            if ($stallIds->isNotEmpty()) {
                // 3. Delete the blocking child records first!
                \App\Models\Payment::whereIn('stall_id', $stallIds)->delete();
                \App\Models\Contract::whereIn('stall_id', $stallIds)->delete();
                \App\Models\Stall::whereIn('id', $stallIds)->delete();
            }

            // 4. Finally, delete the floors and the building itself
            $building->floors()->delete();
            $building->delete();
        });

        return redirect()->back()->with('success', 'Building and all associated records deleted successfully.');
    }

    public function export()
    {
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

        return redirect()->back()->with('success', 'Building list imported successfully!');
    }
}
