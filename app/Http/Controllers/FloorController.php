<?php
//app\Http\Controllers\FloorController.php
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

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('building', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

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
        $query = Floor::with('building')->withCount('stalls');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhereHas('building', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        $allowedSorts = ['building', 'name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'building';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'building') {
            $query->orderBy(Building::select('name')->whereColumn('buildings.id', 'floors.building_id'), $direction)->orderBy('name', 'asc');
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $floors = $query->get();

        $exportData = [];
        foreach ($floors as $floor) {
            $exportData[] = [
                'building_name' => $floor->building->name ?? 'Unassigned',
                'floor_or_section_name' => $floor->name,
                'stall_count' => $floor->stalls_count ?? 0,
                'description' => $floor->description,
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
                return ['building_name', 'floor_or_section_name', 'stall_count', 'description'];
            }
        };

        $filename = 'floors_sections_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        Excel::import(new FloorsImport, $request->file('file'));
        return redirect()->back()->with('success', 'Floors imported successfully.');
    }
}
