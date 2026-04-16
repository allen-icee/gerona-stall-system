<?php
//app\Http\Controllers\BuildingController.php
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

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $allowedSorts = ['name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'name';
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
            'name' => 'required|string|max:50|unique:buildings,name',
            'description' => 'nullable|string|max:255'
        ]);

        Building::create($validated);
        return redirect()->route('buildings.index')->with('success', 'Building created successfully.');
    }

    public function update(Request $request, Building $building)
    {
        $request->merge(['name' => strtoupper($request->name)]);

        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:buildings,name,' . $building->id,
            'description' => 'nullable|string|max:255'
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
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        $allowedSorts = ['name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'name';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        $query->orderBy($sortBy, $direction);
        $buildings = $query->get();

        $exportData = [];
        foreach ($buildings as $building) {
            $exportData[] = [
                'name' => $building->name,
                'description' => $building->description,
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
                return ['name', 'description'];
            }
        };

        $filename = 'buildings_' . now()->format('Y-m-d') . '.xlsx';
        return Excel::download($export, $filename);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:csv,txt,xlsx,xls|max:2048']);
        Excel::import(new BuildingsImport, $request->file('file'));
        return redirect()->route('buildings.index')->with('success', 'Buildings imported successfully.');
    }
}
