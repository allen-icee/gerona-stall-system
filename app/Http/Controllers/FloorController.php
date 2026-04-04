<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Imports\FloorsImport;
use Maatwebsite\Excel\Facades\Excel;

class FloorController extends Controller
{
    public function index(Request $request)
    {
        $query = Floor::with('building');

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('name', 'like', $searchTerm)
                ->orWhere('description', 'like', $searchTerm)
                ->orWhereHas('building', function ($q) use ($searchTerm) {
                    $q->where('name', 'like', $searchTerm);
                });
        }

        // Gold Standard: Alphabetical sorting
        $floors = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();
        $buildings = Building::orderBy('name', 'asc')->get();

        return Inertia::render('Floors/Index', [
            'floors' => $floors,
            'buildings' => $buildings,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Floor::create($validated);

        return redirect()->back()->with('success', 'Floor successfully registered!');
    }

    public function update(Request $request, Floor $floor)
    {
        $validated = $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $floor->update($validated);

        return redirect()->back()->with('success', 'Floor details updated!');
    }

    public function destroy(Floor $floor)
    {
        // Gold Standard: Transaction safely deletes children before the parent
        DB::transaction(function () use ($floor) {
            $stallIds = $floor->stalls()->pluck('id');

            if ($stallIds->isNotEmpty()) {
                \App\Models\Payment::whereIn('stall_id', $stallIds)->delete();
                \App\Models\Contract::whereIn('stall_id', $stallIds)->delete();
                \App\Models\Stall::whereIn('id', $stallIds)->delete();
            }

            $floor->delete();
        });

        return redirect()->back()->with('success', 'Floor and all associated stalls deleted successfully.');
    }

    public function export()
    {
        $floors = Floor::with('building')->orderBy('name', 'asc')->get();
        // Exact headers for the import class
        $csvData = "name,building,description\n";

        foreach ($floors as $floor) {
            $buildingName = $floor->building ? $floor->building->name : '';

            $name = '"' . str_replace('"', '""', $floor->name) . '"';
            $building = '"' . str_replace('"', '""', $buildingName) . '"';
            $desc = '"' . str_replace('"', '""', $floor->description ?? '') . '"';

            $csvData .= "{$name},{$building},{$desc}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="floors_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls|max:2048'
        ]);

        try {
            Excel::import(new FloorsImport, $request->file('file'));
            return redirect()->back()->with('success', 'Floors synced successfully! New entries created and existing ones updated.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed. Ensure your columns are "name", "building", and "description".');
        }
    }
}
