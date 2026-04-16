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
            ->with('success', 'Grid generated successfully!');
    }

    public function expand(Request $request, Layout $layout)
    {
        if ($request->has('cells')) {
            foreach ($request->input('cells') as $cellData) {
                LayoutCell::where('id', $cellData['id'])->update([
                    'type' => $cellData['type'],
                    'stall_id' => $cellData['stall_id'],
                    'text' => $cellData['text'] ?? null,
                ]);
            }
        }

        $direction = $request->input('direction');

        $amount = max(1, (int) $request->input('amount', 1));

        if ($direction === 'row') {
            $cells = [];
            for ($i = 0; $i < $amount; $i++) {
                $newRow = $layout->total_rows + 1 + $i;
                for ($c = 1; $c <= $layout->total_cols; $c++) {
                    $cells[] = [
                        'layout_id' => $layout->id,
                        'row_number' => $newRow,
                        'column_number' => $c,
                        'type' => 'vacant',
                        'stall_id' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            $layout->total_rows += $amount;
            $layout->save();
            LayoutCell::insert($cells);
        } elseif ($direction === 'col') {
            $cells = [];
            for ($i = 0; $i < $amount; $i++) {
                $newCol = $layout->total_cols + 1 + $i;
                for ($r = 1; $r <= $layout->total_rows; $r++) {
                    $cells[] = [
                        'layout_id' => $layout->id,
                        'row_number' => $r,
                        'column_number' => $newCol,
                        'type' => 'vacant',
                        'stall_id' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            $layout->total_cols += $amount;
            $layout->save();
            LayoutCell::insert($cells);
        }

        return redirect()->route('layouts.mapper', ['floor_id' => $layout->floor_id])
            ->with('success', "Grid expanded by {$amount} {$direction}(s) and progress auto-saved!");
    }

    public function shrink(Request $request, Layout $layout)
    {
        if ($request->has('cells')) {
            foreach ($request->input('cells') as $cellData) {
                LayoutCell::where('id', $cellData['id'])->update([
                    'type' => $cellData['type'],
                    'stall_id' => $cellData['stall_id'],
                    'text' => $cellData['text'] ?? null,
                ]);
            }
        }

        $direction = $request->input('direction');

        $amount = max(1, (int) $request->input('amount', 1));

        if ($direction === 'row') {
            $amount = min($amount, $layout->total_rows - 1);
            if ($amount > 0) {
                LayoutCell::where('layout_id', $layout->id)
                    ->where('row_number', '>', $layout->total_rows - $amount)
                    ->delete();
                $layout->total_rows -= $amount;
                $layout->save();
            }
        } elseif ($direction === 'col') {
            $amount = min($amount, $layout->total_cols - 1);
            if ($amount > 0) {
                LayoutCell::where('layout_id', $layout->id)
                    ->where('column_number', '>', $layout->total_cols - $amount)
                    ->delete();
                $layout->total_cols -= $amount;
                $layout->save();
            }
        }

        return redirect()->route('layouts.mapper', ['floor_id' => $layout->floor_id])
            ->with('success', "Grid trimmed by {$amount} {$direction}(s) and progress auto-saved!");
    }

    public function saveMap(Request $request, Layout $layout)
    {
        $cells = $request->input('cells');
        foreach ($cells as $cellData) {
            LayoutCell::where('id', $cellData['id'])->update([
                'type' => $cellData['type'],
                'stall_id' => $cellData['stall_id'],
                'text' => $cellData['text'] ?? null,
            ]);
        }
        return redirect()->back()->with('success', 'Map layout updated successfully!');
    }
}
