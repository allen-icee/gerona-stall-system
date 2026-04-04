<?php

namespace App\Http\Controllers;

use App\Models\Stall;
use App\Models\Floor;
use App\Models\Status;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StallController extends Controller
{
    public function index(Request $request)
    {
        $query = Stall::with(['floor.building', 'status']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('stall_code', 'like', $searchTerm)
                ->orWhereHas('floor', function ($q) use ($searchTerm) {
                    $q->where('name', 'like', $searchTerm)
                        ->orWhereHas('building', function ($q2) use ($searchTerm) {
                            $q2->where('name', 'like', $searchTerm);
                        });
                })
                ->orWhereHas('status', function ($q) use ($searchTerm) {
                    $q->where('name', 'like', $searchTerm);
                });
        }

        $stalls = $query->latest()->paginate(10)->withQueryString();
        $floors = Floor::with('building')->orderBy('name')->get();
        $statuses = Status::orderBy('name')->get();

        return Inertia::render('Stalls/Index', [
            'stalls' => $stalls,
            'floors' => $floors,
            'statuses' => $statuses,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => 'required|string|max:255|unique:stalls,stall_code',
            'status_id' => 'required|exists:statuses,id',
        ]);

        Stall::create($validated);

        return redirect()->back()->with('success', 'Stall successfully registered!');
    }

    public function update(Request $request, Stall $stall)
    {
        $validated = $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => 'required|string|max:255|unique:stalls,stall_code,' . $stall->id,
            'status_id' => 'required|exists:statuses,id',
        ]);

        $stall->update($validated);

        return redirect()->back()->with('success', 'Stall details updated!');
    }

    public function destroy(Stall $stall)
    {
        // THE FIX: Transaction safely deletes children before the parent
        DB::transaction(function () use ($stall) {
            \App\Models\Payment::where('stall_id', $stall->id)->delete();
            \App\Models\Contract::where('stall_id', $stall->id)->delete();
            $stall->delete();
        });

        return redirect()->back()->with('success', 'Stall and associated records successfully deleted.');
    }

    public function export()
    {
        $stalls = Stall::with(['floor.building', 'status'])->get();
        $csvData = "ID,Stall Code,Floor,Building,Status,Created At\n";
        foreach ($stalls as $stall) {
            $floorName = $stall->floor ? $stall->floor->name : 'N/A';
            $buildingName = ($stall->floor && $stall->floor->building) ? $stall->floor->building->name : 'N/A';
            $statusName = $stall->status ? $stall->status->name : 'N/A';
            $csvData .= "{$stall->id},{$stall->stall_code},{$floorName},{$buildingName},{$statusName},{$stall->created_at}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="stalls_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls|max:2048'
        ]);

        return redirect()->back()->with('success', 'Stalls imported successfully!');
    }
}
