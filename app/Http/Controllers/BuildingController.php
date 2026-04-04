<?php

namespace App\Http\Controllers;

use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Imports\BuildingsImport;
use Maatwebsite\Excel\Facades\Excel;

class BuildingController extends Controller
{
    public function index(Request $request)
    {
        $query = Building::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Changed from latest() to alphabetical sorting
        $buildings = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();

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
        DB::transaction(function () use ($building) {
            $floorIds = $building->floors()->pluck('id');
            $stallIds = \App\Models\Stall::whereIn('floor_id', $floorIds)->pluck('id');

            if ($stallIds->isNotEmpty()) {
                \App\Models\Payment::whereIn('stall_id', $stallIds)->delete();
                \App\Models\Contract::whereIn('stall_id', $stallIds)->delete();
                \App\Models\Stall::whereIn('id', $stallIds)->delete();
            }

            $building->floors()->delete();
            $building->delete();
        });

        return redirect()->back()->with('success', 'Building and all associated records deleted successfully.');
    }

    public function export()
    {
        $buildings = Building::orderBy('name')->get();
        $csvData = "name,description\n"; // Headers specifically matching what the import expects
        foreach ($buildings as $building) {
            $csvData .= "\"{$building->name}\",\"{$building->description}\"\n";
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

        try {
            Excel::import(new BuildingsImport, $request->file('file'));
            return redirect()->back()->with('success', 'Buildings synced successfully! New entries created and existing ones updated.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed. Ensure your columns are "name" and "description".');
        }
    }
}
