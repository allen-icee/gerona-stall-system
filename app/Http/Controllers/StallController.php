<?php

namespace App\Http\Controllers;

use App\Models\Stall;
use App\Models\Floor;
use App\Models\Status;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StallController extends Controller
{
    public function index(Request $request)
    {
        // Eager load relationships to display in the table
        $query = Stall::with(['floor.building', 'status']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('stall_code', 'like', "%{$search}%");
        }

        $stalls = $query->latest()->paginate(10)->withQueryString();

        // Data for the frontend dropdowns
        $floors = Floor::with('building')->orderBy('name')->get();
        $statuses = Status::all(); // Fetch all available statuses

        return Inertia::render('Stalls/Index', [
            'stalls' => $stalls,
            'floors' => $floors,
            'statuses' => $statuses,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => 'required|string|max:50|unique:stalls,stall_code',
            'status_id' => 'required|exists:statuses,id'
        ]);

        // Find the floor so we can automatically grab its building_id
        $floor = Floor::findOrFail($request->floor_id);

        Stall::create([
            'stall_code' => $request->stall_code,
            'floor_id' => $request->floor_id,
            'building_id' => $floor->building_id, // Auto-assigned!
            'status_id' => $request->status_id,
        ]);

        return redirect()->back()->with('success', 'Stall added successfully.');
    }

    public function update(Request $request, Stall $stall)
    {
        $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'stall_code' => 'required|string|max:50|unique:stalls,stall_code,' . $stall->id,
            'status_id' => 'required|exists:statuses,id'
        ]);

        $floor = Floor::findOrFail($request->floor_id);

        $stall->update([
            'stall_code' => $request->stall_code,
            'floor_id' => $request->floor_id,
            'building_id' => $floor->building_id,
            'status_id' => $request->status_id,
        ]);

        return redirect()->back()->with('success', 'Stall updated successfully.');
    }

    public function destroy(Stall $stall)
    {
        $stall->delete();
        return redirect()->back()->with('success', 'Stall deleted successfully.');
    }
}