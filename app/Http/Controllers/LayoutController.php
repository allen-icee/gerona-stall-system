<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Floor;
use App\Models\Layout;
use App\Models\LayoutCell;
use App\Models\Stall;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LayoutController extends Controller
{
    // 1. Load the Mapper Interface
    public function mapper(Request $request)
    {
        // Load buildings and floors for the sidebar dropdown
        $buildings = Building::with('floors')->orderBy('name')->get();

        $floor_id = $request->floor_id;
        $layout = null;
        $stalls = [];

        if ($floor_id) {
            // Get the layout and its cells (with the assigned stalls and their colors)
            $layout = Layout::with(['cells.stall.status'])
                ->where('floor_id', $floor_id)
                ->first();

            // Get all stalls for this floor so we can drop them onto the map
            $stalls = Stall::where('floor_id', $floor_id)->with('status')->get();
        }

        return Inertia::render('Layouts/Mapper', [
            'buildings' => $buildings,
            'current_floor_id' => (int) $floor_id,
            'layout' => $layout,
            'stalls' => $stalls,
        ]);
    }

    // 2. Generate a new blank grid
    public function generate(Request $request)
    {
        $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'name' => 'required|string',
            'total_rows' => 'required|integer|min:1|max:50',
            'total_cols' => 'required|integer|min:1|max:50',
        ]);

        $layout = Layout::create($request->only('floor_id', 'name', 'total_rows', 'total_cols'));

        // Automatically create the blank cells
        $cells = [];
        for ($r = 1; $r <= $layout->total_rows; $r++) {
            for ($c = 1; $c <= $layout->total_cols; $c++) {
                $cells[] = [
                    'layout_id' => $layout->id,
                    'row_number' => $r,
                    'column_number' => $c,
                    'type' => 'vacant',
                    'stall_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        LayoutCell::insert($cells);

        return redirect()->route('layouts.mapper', ['floor_id' => $request->floor_id])
            ->with('success', 'Grid generated successfully! You can now design the map.');
    }

    // 3. Save the mapped cells
    public function saveMap(Request $request, Layout $layout)
    {
        $cells = $request->input('cells'); // Array of cell data from React

        // Bulk update the cells
        foreach ($cells as $cellData) {
            LayoutCell::where('id', $cellData['id'])->update([
                'type' => $cellData['type'],
                'stall_id' => $cellData['stall_id'],
            ]);
        }

        return redirect()->back()->with('success', 'Map layout saved successfully!');
    }
}