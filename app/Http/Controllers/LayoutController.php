<?php
//app\Http\Controllers\LayoutController.php
namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Floor;
use App\Models\Layout;
use App\Models\LayoutCell;
use App\Models\Stall;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LayoutController extends Controller
{
    public function mapper(Request $request)
    {
        $buildings = Building::with('floors')->orderBy('name')->get();
        $floor_id = $request->floor_id;
        $layout = null;
        $stalls = [];

        if ($floor_id) {
            $layout = Layout::with([
                'cells' => function ($query) {
                    $query->orderBy('row_number', 'asc')->orderBy('column_number', 'asc');
                },
                'cells.stall.activeContract.tenant'
            ])
                ->where('floor_id', $floor_id)
                ->first();

            $stalls = Stall::where('floor_id', $floor_id)->with('activeContract.tenant')->get();
        }

        return Inertia::render('Layouts/Mapper', [
            'buildings' => $buildings,
            'current_floor_id' => (int) $floor_id,
            'layout' => $layout,
            'stalls' => $stalls,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'floor_id' => 'required|exists:floors,id',
            'name' => 'required|string',
            'total_rows' => 'required|integer|min:1|max:50',
            'total_cols' => 'required|integer|min:1|max:50',
        ]);

        $layout = Layout::create($request->only('floor_id', 'name', 'total_rows', 'total_cols'));

        $cells = [];
        $now = now();
        for ($r = 1; $r <= $layout->total_rows; $r++) {
            for ($c = 1; $c <= $layout->total_cols; $c++) {
                $cells[] = [
                    'layout_id' => $layout->id,
                    'row_number' => $r,
                    'column_number' => $c,
                    'type' => 'vacant',
                    'stall_id' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        LayoutCell::insert($cells);

        return redirect()->route('layouts.mapper', ['floor_id' => $request->floor_id])
            ->with('success', 'Grid generated successfully!');
    }

    // Completely revamped save method. It dynamically re-calculates row/col based on the frontend array.
    public function saveMap(Request $request, Layout $layout)
    {
        $request->validate([
            'total_rows' => 'required|integer|min:1',
            'total_cols' => 'required|integer|min:1',
            'cells' => 'required|array'
        ]);

        DB::transaction(function () use ($request, $layout) {
            // 1. Update the dimensions
            $layout->update([
                'total_rows' => $request->total_rows,
                'total_cols' => $request->total_cols,
            ]);

            // 2. Wipe the old map cells
            $layout->cells()->delete();

            // 3. Insert the new ones exactly as the frontend arranged them
            $newCells = [];
            $now = now();
            $cols = $request->total_cols;

            foreach ($request->cells as $index => $cell) {
                $newCells[] = [
                    'layout_id' => $layout->id,
                    'row_number' => floor($index / $cols) + 1, // Auto-calculate Row
                    'column_number' => ($index % $cols) + 1,   // Auto-calculate Col
                    'type' => $cell['type'] ?? 'vacant',
                    'stall_id' => $cell['stall_id'] ?? null,
                    'text' => $cell['text'] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Insert in chunks to prevent database memory overload if the grid is massive
            foreach (array_chunk($newCells, 500) as $chunk) {
                LayoutCell::insert($chunk);
            }
        });

        return redirect()->back()->with('success', 'Map layout updated successfully!');
    }
}
