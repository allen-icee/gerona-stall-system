<?php
//app\Http\Controllers\TenantController.php
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

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('first_name', 'like', $searchTerm)
                ->orWhere('last_name', 'like', $searchTerm)
                ->orWhere('company_name', 'like', $searchTerm)
                ->orWhere('contact_number', 'like', $searchTerm);
        }

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
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
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
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
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
            $contractIds = \App\Models\Contract::where('tenant_id', $tenant->id)->pluck('id');

            if ($contractIds->isNotEmpty()) {
                \App\Models\Payment::whereIn('contract_id', $contractIds)->delete();
            }

            \App\Models\Contract::where('tenant_id', $tenant->id)->delete();
            $tenant->delete();
        });

        return redirect()->back()->with('success', 'Tenant and all associated records successfully deleted.');
    }

    public function export(Request $request)
    {
        $query = Tenant::query();

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where('first_name', 'like', $searchTerm)
                ->orWhere('last_name', 'like', $searchTerm)
                ->orWhere('company_name', 'like', $searchTerm)
                ->orWhere('contact_number', 'like', $searchTerm);
        }

        $allowedSorts = ['last_name', 'first_name', 'company_name', 'created_at'];
        $sortBy = in_array($request->input('sort'), $allowedSorts) ? $request->input('sort') : 'last_name';
        $direction = strtolower($request->input('direction')) === 'desc' ? 'desc' : 'asc';

        $tenants = $query->orderBy($sortBy, $direction)->get();

        $csvData = "first_name,middle_name,last_name,suffix,business_name,contact_number,address\n";

        foreach ($tenants as $tenant) {
            $first = '"' . str_replace('"', '""', $tenant->first_name ?? '') . '"';
            $middle = '"' . str_replace('"', '""', $tenant->middle_name ?? '') . '"';
            $last = '"' . str_replace('"', '""', $tenant->last_name ?? '') . '"';
            $suffix = '"' . str_replace('"', '""', $tenant->suffix ?? '') . '"';
            $business = '"' . str_replace('"', '""', $tenant->company_name ?? '') . '"';
            $contact = '"' . str_replace('"', '""', $tenant->contact_number ?? '') . '"';
            $address = '"' . str_replace('"', '""', $tenant->address ?? '') . '"';

            $csvData .= "{$first},{$middle},{$last},{$suffix},{$business},{$contact},{$address}\n";
        }

        $filename = 'tenants_' . now()->format('Y-m-d') . '.csv';

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
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
            return redirect()->back()->with('error', 'Import failed. Ensure your columns match the export format.');
        }
    }
}