<?php

namespace App\Http\Controllers;

use App\Models\Penalty;
use App\Services\PenaltyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PenaltyController extends Controller
{
    public function index(Request $request)
    {
        $query = Penalty::with(['contract.tenant', 'contract.stall.floor.building', 'approver']);

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->whereHas('contract.tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                    ->orWhere('last_name', 'like', $searchTerm);
            })->orWhereHas('contract.stall', function ($q) use ($searchTerm) {
                $q->where('stall_code', 'like', $searchTerm);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $penalties = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Penalties/Index', [
            'penalties' => $penalties,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    // New method: Manually Create a Penalty
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'month_covered' => 'required|string',
            'original_amount' => 'required|numeric|min:1',
            'notes' => 'nullable|string|max:255'
        ]);

        $validated['status'] = 'approved'; // Instantly active
        $validated['is_auto_generated'] = false; // Manually added by admin
        $validated['approved_by'] = Auth::id() ?? 1;
        $validated['approved_at'] = now();

        Penalty::create($validated);

        return redirect()->back()->with('success', 'Late penalty applied to tenant ledger.');
    }

    public function process(Request $request, Penalty $penalty, PenaltyService $penaltyService)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,waived',
            'adjusted_amount' => 'required_if:status,approved|nullable|numeric|min:0',
            'admin_notes' => 'required_if:status,waived|nullable|string|max:1000',
        ]);

        $penaltyService->processPenalty($penalty, $validated, Auth::id() ?? 1);

        return redirect()->back()->with('success', 'Penalty review saved.');
    }

    // New method: Waive/Delete a mistake penalty
    public function destroy(Penalty $penalty)
    {
        $penalty->delete();
        return redirect()->back()->with('success', 'Penalty removed/waived.');
    }
}
