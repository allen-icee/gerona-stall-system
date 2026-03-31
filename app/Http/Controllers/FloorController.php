<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Building;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FloorController extends Controller
{
    public function index(Request $request)
    {
        // Load floors and their associated building
        $query = Floor::with('building');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('building', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        $floors = $query->latest()->paginate(10)->withQueryString();

        // We need all buildings for the "Create Floor" dropdown
        $buildings = Building::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Floors/Index', [
            'floors' => $floors,
            'buildings' => $buildings,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        Floor::create($request->all());

        return redirect()->back()->with('success', 'Floor/Section added successfully.');
    }

    public function update(Request $request, Floor $floor)
    {
        $request->validate([
            'building_id' => 'required|exists:buildings,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $floor->update($request->all());

        return redirect()->back()->with('success', 'Floor/Section updated successfully.');
    }

    public function destroy(Floor $floor)
    {
        $floor->delete();
        return redirect()->back()->with('success', 'Floor/Section deleted successfully.');
    }
}