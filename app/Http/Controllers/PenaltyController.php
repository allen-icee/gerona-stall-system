<?php
//app\Http\Controllers\PenaltyController.php
namespace App\Http\Controllers;

use App\Models\Penalty;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PenaltyController extends Controller
{
    public function index(Request $request)
    {
        $query = Penalty::with(['contract.tenant', 'contract.stall.floor.building', 'approver']);

        $status = $request->input('status', 'pending');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->whereHas('contract.tenant', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', $searchTerm)
                    ->orWhere('last_name', 'like', $searchTerm);
            })->orWhereHas('contract.stall', function ($q) use ($searchTerm) {
                $q->where('stall_code', 'like', $searchTerm);
            });
        }

        $penalties = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Penalties/Index', [
            'penalties' => $penalties,
            'filters' => ['status' => $status, 'search' => $request->search],
        ]);
    }

    public function process(Request $request, Penalty $penalty)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,waived',
            'adjusted_amount' => 'nullable|numeric|min:0',
            'admin_notes' => 'nullable|string|max:255'
        ]);

        $finalAmount = $validated['status'] === 'waived' ? 0 : ($validated['adjusted_amount'] ?? $penalty->original_amount);

        $newNotes = $penalty->notes;
        if (!empty($validated['admin_notes'])) {
            $newNotes .= "\n[Admin Review]: " . $validated['admin_notes'];
        }

        $penalty->update([
            'status' => $validated['status'],
            'adjusted_amount' => $finalAmount,
            'notes' => $newNotes,
            'approved_by' => Auth::id(),
            'approved_at' => now()
        ]);

        $message = $validated['status'] === 'approved'
            ? 'Penalty successfully approved and added to tenant balance.'
            : 'Penalty has been officially waived.';

        return redirect()->back()->with('success', $message);
    }
}
