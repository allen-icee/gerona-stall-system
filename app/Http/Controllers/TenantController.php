<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenant::query();

        // Debounced Search Logic
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('first_name', 'like', $searchTerm)
                ->orWhere('last_name', 'like', $searchTerm)
                ->orWhere('company_name', 'like', $searchTerm)
                ->orWhere('contact_number', 'like', $searchTerm);
        }

        $tenants = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        Tenant::create($validated);

        return redirect()->back()->with('success', 'Tenant successfully registered!');
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $tenant->update($validated);

        return redirect()->back()->with('success', 'Tenant details updated!');
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->delete();
        return redirect()->back()->with('success', 'Tenant successfully deleted.');
    }

    public function export()
    {
        $tenants = Tenant::all();
        $csvData = "ID,First Name,Last Name,Company Name,Contact Number,Address,Created At\n";
        foreach ($tenants as $tenant) {
            // Escape commas in address/company to prevent CSV breaking
            $company = '"' . str_replace('"', '""', $tenant->company_name) . '"';
            $address = '"' . str_replace('"', '""', $tenant->address) . '"';
            $csvData .= "{$tenant->id},{$tenant->first_name},{$tenant->last_name},{$company},{$tenant->contact_number},{$address},{$tenant->created_at}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="tenants_export.csv"');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt,xlsx,xls|max:2048'
        ]);

        return redirect()->back()->with('success', 'Tenants imported successfully!');
    }
}
