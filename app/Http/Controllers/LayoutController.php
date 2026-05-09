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
                // The 'status' relation has been safely removed here!
                'cells.stall.activeContracts.tenant'
            ])
                ->where('floor_id', $floor_id)
                ->first();

            // The 'status' relation has been safely removed here as well!
            $stalls = Stall::where('floor_id', $floor_id)
                ->with(['activeContracts.tenant'])
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

        $stallIds = collect($request->cells)->pluck('stall_id')->filter()->unique();

        if ($stallIds->isNotEmpty()) {
            $validStallCount = Stall::whereIn('id', $stallIds)
                ->where('floor_id', $layout->floor_id)
                ->count();

            if ($validStallCount !== $stallIds->count()) {
                return redirect()->back()->withErrors([
                    'error' => 'Map sync failed. The layout contains stalls that do not exist.'
                ]);
            }
        }

        DB::transaction(function () use ($request, $layout) {
            $layout->update([
                'total_rows' => $request->total_rows,
                'total_cols' => $request->total_cols,
            ]);

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
                    'col_span' => $cell['colSpan'] ?? 1, // Added!
                    'row_span' => $cell['rowSpan'] ?? 1, // Added!
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            foreach (array_chunk($upsertData, 500) as $chunk) {
                LayoutCell::upsert(
                    $chunk,
                    ['layout_id', 'row_number', 'column_number'],
                    ['type', 'stall_id', 'text', 'col_span', 'row_span', 'updated_at'] // Added!
                );
            }
        });

        return redirect()->back()->with('success', 'Map layout updated successfully!');
    }
}
