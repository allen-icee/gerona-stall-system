<?php

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
                // Phase 3: Inject Real-Time Status into the Map JSON
                'cells.stall.status',
                'cells.stall.activeContracts.tenant'
            ])
                ->where('floor_id', $floor_id)
                ->first();

            // Phase 3: Inject Real-Time Status into the standalone stalls array
            $stalls = Stall::where('floor_id', $floor_id)
                ->with(['status', 'activeContracts.tenant'])
                ->get();
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

    public function saveMap(Request $request, Layout $layout)
    {
        $request->validate([
            'total_rows' => 'required|integer|min:1',
            'total_cols' => 'required|integer|min:1',
            'cells' => 'required|array'
        ]);

        // --- PRE-CHECK GUARDRAIL ---
        // 1. Pluck all non-null stall_ids from the incoming JSON map
        $stallIds = collect($request->cells)->pluck('stall_id')->filter()->unique();

        if ($stallIds->isNotEmpty()) {
            // 2. Verify all extracted IDs actually exist AND belong to this specific floor
            $validStallCount = Stall::whereIn('id', $stallIds)
                ->where('floor_id', $layout->floor_id)
                ->count();

            // 3. If the counts don't match, the JSON is out of sync with the DB. Abort.
            if ($validStallCount !== $stallIds->count()) {
                return redirect()->back()->withErrors([
                    'error' => 'Map sync failed. The layout contains stalls that do not exist in the database for this floor. Please upload the Stalls Excel file first.'
                ]);
            }
        }
        // ---------------------------

        DB::transaction(function () use ($request, $layout) {
            $layout->update([
                'total_rows' => $request->total_rows,
                'total_cols' => $request->total_cols,
            ]);

            // Safely delete ONLY cells that fall outside the new grid dimensions (if the grid was shrunk)
            $layout->cells()
                ->where(function ($query) use ($request) {
                    $query->where('row_number', '>', $request->total_rows)
                        ->orWhere('column_number', '>', $request->total_cols);
                })
                ->delete();

            $upsertData = [];
            $now = now();
            $cols = $request->total_cols;

            foreach ($request->cells as $index => $cell) {
                $upsertData[] = [
                    'layout_id' => $layout->id,
                    'row_number' => floor($index / $cols) + 1,
                    'column_number' => ($index % $cols) + 1,
                    'type' => $cell['type'] ?? 'vacant',
                    'stall_id' => $cell['stall_id'] ?? null,
                    'text' => $cell['text'] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Safely upsert in chunks to prevent memory limits without wiping the table first
            foreach (array_chunk($upsertData, 500) as $chunk) {
                LayoutCell::upsert(
                    $chunk,
                    ['layout_id', 'row_number', 'column_number'], // Unique constraints to match
                    ['type', 'stall_id', 'text', 'updated_at']    // Columns to update if match found
                );
            }
        });

        return redirect()->back()->with('success', 'Map layout updated successfully!');
    }
}
