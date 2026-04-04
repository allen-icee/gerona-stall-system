<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Imports\TenantsImport;
use Maatwebsite\Excel\Facades\Excel;

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

        // Gold Standard: Alphabetical sorting by last name
        $tenants = $query->orderBy('last_name', 'asc')->paginate(10)->withQueryString();

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
        // Gold Standard: Transaction safely deletes children before the parent
        DB::transaction(function () use ($tenant) {
            // Sweep dependent records (assuming a Tenant has payments and contracts)
            \App\Models\Payment::where('tenant_id', $tenant->id)->delete();
            \App\Models\Contract::where('tenant_id', $tenant->id)->delete();
            $tenant->delete();
        });

        return redirect()->back()->with('success', 'Tenant and all associated records successfully deleted.');
    }

    public function export()
    {
        $tenants = Tenant::orderBy('last_name', 'asc')->get();

        // Gold Standard: Exact header match for the smart Import class
        $csvData = "first_name,last_name,company_name,contact_number,address\n";

        foreach ($tenants as $tenant) {
            // Escape commas in address/company to prevent CSV breaking
            $first = '"' . str_replace('"', '""', $tenant->first_name) . '"';
            $last = '"' . str_replace('"', '""', $tenant->last_name) . '"';
            $company = '"' . str_replace('"', '""', $tenant->company_name) . '"';
            $contact = '"' . str_replace('"', '""', $tenant->contact_number) . '"';
            $address = '"' . str_replace('"', '""', $tenant->address) . '"';

            $csvData .= "{$first},{$last},{$company},{$contact},{$address}\n";
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

        try {
            Excel::import(new TenantsImport, $request->file('file'));
            return redirect()->back()->with('success', 'Tenants synced successfully! New entries created and existing ones updated.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Import failed. Ensure your columns are exactly: "first_name", "last_name", "company_name", "contact_number", "address".');
        }
    }
}
