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

        // Search Filter
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('first_name', 'like', $searchTerm)
                ->orWhere('last_name', 'like', $searchTerm)
                ->orWhere('company_name', 'like', $searchTerm)
                ->orWhere('contact_number', 'like', $searchTerm);
        }

        // 🔥 BULLETPROOF SORTING 🔥
        $allowedSorts = ['last_name', 'first_name', 'company_name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'last_name';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        $tenants = $query->orderBy($sortBy, $direction)->paginate(15)->withQueryString();

        return Inertia::render('Tenants/Index', [
            'tenants' => $tenants,
            'filters' => $request->only(['search', 'sort', 'direction']),
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
        DB::transaction(function () use ($tenant) {
            \App\Models\Payment::where('tenant_id', $tenant->id)->delete();
            \App\Models\Contract::where('tenant_id', $tenant->id)->delete();
            $tenant->delete();
        });

        return redirect()->back()->with('success', 'Tenant and all associated records successfully deleted.');
    }

    public function export(Request $request)
    {
        $query = Tenant::query();

        // Apply filters to Export
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('first_name', 'like', $searchTerm)
                ->orWhere('last_name', 'like', $searchTerm)
                ->orWhere('company_name', 'like', $searchTerm)
                ->orWhere('contact_number', 'like', $searchTerm);
        }

        // 🔥 BULLETPROOF EXPORT SORTING 🔥
        $allowedSorts = ['last_name', 'first_name', 'company_name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'last_name';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        $tenants = $query->orderBy($sortBy, $direction)->get();

        $csvData = "first_name,last_name,company_name,contact_number,address\n";

        foreach ($tenants as $tenant) {
            $first = '"' . str_replace('"', '""', $tenant->first_name) . '"';
            $last = '"' . str_replace('"', '""', $tenant->last_name) . '"';
            $company = '"' . str_replace('"', '""', $tenant->company_name) . '"';
            $contact = '"' . str_replace('"', '""', $tenant->contact_number) . '"';
            $address = '"' . str_replace('"', '""', $tenant->address) . '"';

            $csvData .= "{$first},{$last},{$company},{$contact},{$address}\n";
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="filtered_tenants_export.csv"');
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