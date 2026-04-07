import { useState, useEffect, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CreateContractModal from "./Partials/CreateContractModal";
import EditContractModal from "./Partials/EditContractModal";
import Modal from "@/Components/Modal";

export default function ContractsIndex({
    contracts,
    tenants,
    availableStalls,
    filters,
}: any) {
    const { permissions = [] } = (usePage().props as any).auth;
    const canManageContracts = permissions.includes('manage contracts');

    const [search, setSearch] = useState(filters?.search || "");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [viewMode, setViewMode] = useState<"standard" | "ledger">("standard");

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(route("contracts.index"), { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const confirmDelete = (id: number) => setDeletingId(id);
    const handleDelete = () => {
        if (deletingId) {
            router.delete(route("contracts.destroy", deletingId), {
                preserveScroll: true,
                onFinish: () => setDeletingId(null),
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            router.post(route("contracts.import"), { file: e.target.files[0] }, {
                preserveScroll: true, forceFormData: true,
                onSuccess: () => { if (fileInputRef.current) fileInputRef.current.value = ""; },
            });
        }
    };

    const totalContracts = contracts.total || contracts.data.length;
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    return (
        <AuthenticatedLayout>
            <Head title="Lease Contracts & Ledger" />

            <Modal show={deletingId !== null} onClose={() => setDeletingId(null)} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 mb-4 border-2 border-rose-300">
                        <Icon icon="solar:danger-triangle-bold" className="h-8 w-8 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Delete Contract?</h3>
                    <p className="text-sm text-slate-700 font-medium mb-6">
                        Are you sure you want to terminate this contract? The stall will become <strong>Vacant</strong>.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button onClick={() => setDeletingId(null)} className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 border-2 border-rose-700 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors">Yes, Terminate</button>
                    </div>
                </div>
            </Modal>

            <div className="py-12 max-w-[95%] mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Icon icon="solar:document-text-bold-duotone" className="w-7 h-7 text-blue-700" />
                                Master Contracts
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-black border-2 border-blue-200">
                                {totalContracts} {totalContracts === 1 ? "Record" : "Records"}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500">Manage operations, paper trails, and financial ledgers.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-slate-200 p-1 rounded-lg border-2 border-slate-300 shrink-0">
                            <button onClick={() => setViewMode("standard")} className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wide transition-all ${viewMode === 'standard' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Icon icon="solar:folder-with-files-bold-duotone" className="w-4 h-4 inline mr-1" /> EEDO View
                            </button>
                            <button onClick={() => setViewMode("ledger")} className={`px-4 py-1.5 rounded-md text-xs font-black uppercase tracking-wide transition-all ${viewMode === 'ledger' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Icon icon="solar:wallet-money-bold-duotone" className="w-4 h-4 inline mr-1" /> Treasury Ledger
                            </button>
                        </div>

                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon icon="solar:magnifer-bold" className="h-5 w-5 text-slate-400" />
                            </div>
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border-2 border-slate-300 rounded-lg text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-0 focus:border-blue-700 transition-colors" placeholder="Search Tenant or Stall..." />
                        </div>

                        {canManageContracts && (
                            <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 border-2 border-blue-900 text-white font-black uppercase text-xs tracking-wide px-5 py-2.5 rounded-lg shadow-sm transition-colors shrink-0">
                                <Icon icon="solar:document-add-bold-duotone" className="w-5 h-5" />
                                <span className="hidden sm:inline">Draft Contract</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-300 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            {viewMode === "standard" ? (
                                <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-300">
                                    <tr>
                                        <th className="px-4 py-4 text-center">#</th>
                                        <th className="px-4 py-4">Tenant / Stall</th>
                                        <th className="px-4 py-4 text-center">Period</th>
                                        <th className="px-4 py-4 bg-amber-50">Document Status</th>
                                        <th className="px-4 py-4 bg-fuchsia-50">Permit Status</th>
                                        <th className="px-4 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                            ) : (
                                <thead className="bg-slate-800 text-slate-300 font-black uppercase text-[10px] tracking-wider border-b-2 border-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 sticky left-0 bg-slate-900 z-10 border-r-2 border-slate-700">Entity Details</th>
                                        <th className="px-4 py-3 text-right bg-rose-900/50 border-r border-slate-700 text-rose-300">Variance (Dep)</th>
                                        <th className="px-4 py-3 text-right bg-rose-900/50 border-r-2 border-slate-700 text-rose-300">Out. Balance</th>
                                        {months.map(m => <th key={m} className="px-3 py-3 text-center border-r border-slate-700 text-emerald-400">{m}</th>)}
                                        <th className="px-4 py-3 text-center sticky right-0 bg-slate-900 z-10">Act</th>
                                    </tr>
                                </thead>
                            )}

                            <tbody className="divide-y-2 divide-slate-200">
                                {contracts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={viewMode === 'standard' ? 6 : 16} className="px-6 py-12 text-center text-slate-400 font-bold">
                                            <Icon icon="solar:folder-error-bold-duotone" className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-300" />
                                            No contracts found.
                                        </td>
                                    </tr>
                                ) : (
                                    contracts.data.map((contract: any, index: number) => (
                                        <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                                            {viewMode === "standard" && (
                                                <>
                                                    <td className="px-4 py-4 font-bold text-slate-500 text-center border-r border-slate-200">{(contracts.from || 1) + index}</td>
                                                    <td className="px-4 py-4 border-r border-slate-200">
                                                        <div className="font-black text-slate-900">{contract.tenant?.first_name} {contract.tenant?.last_name}</div>
                                                        <div className="text-xs font-bold text-slate-500 mt-0.5">Stall: <span className="text-blue-700">{contract.stall?.stall_code}</span></div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center border-r border-slate-200">
                                                        <div className="font-bold text-slate-800 text-xs">{contract.start_date}</div>
                                                        <div className="text-[10px] text-slate-400">to</div>
                                                        <div className="font-bold text-slate-800 text-xs">{contract.end_date}</div>
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-slate-200 bg-amber-50/30">
                                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md border ${contract.document_status === 'Signed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                                                            {contract.document_status || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 border-r border-slate-200 bg-fuchsia-50/30">
                                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md border ${contract.permit_status === 'Valid' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : contract.permit_status === 'Unpaid' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300'}`}>
                                                            {contract.permit_status || 'Waiting'}
                                                        </span>
                                                    </td>
                                                </>
                                            )}
                                            {viewMode === "ledger" && (
                                                <>
                                                    <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r-2 border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                        <div className="font-black text-slate-900 text-xs">{contract.tenant?.last_name}, {contract.tenant?.first_name}</div>
                                                        <div className="text-[10px] font-bold text-blue-700 mt-0.5">{contract.stall?.stall_code} | {contract.monthly_rent}/mo</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right bg-rose-50/30 border-r border-slate-200">
                                                        <span className={`font-black text-xs ${contract.deposit_variance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                            {contract.deposit_variance > 0 ? `₱ ${Number(contract.deposit_variance).toLocaleString()}` : 'CLEARED'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right bg-rose-50/30 border-r-2 border-slate-300">
                                                        <span className={`font-black text-xs ${contract.outstanding_balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                            {contract.outstanding_balance > 0 ? `₱ ${Number(contract.outstanding_balance).toLocaleString()}` : 'CLEARED'}
                                                        </span>
                                                    </td>
                                                    {months.map(m => {
                                                        const paidInMonth = contract.monthly_matrix?.[m] || 0;
                                                        return (
                                                            <td key={m} className={`px-3 py-3 text-center border-r border-slate-200 text-xs font-bold ${paidInMonth > 0 ? 'bg-emerald-50 text-emerald-700' : 'text-slate-300'}`}>
                                                                {paidInMonth > 0 ? `₱ ${Number(paidInMonth).toLocaleString()}` : '-'}
                                                            </td>
                                                        );
                                                    })}
                                                </>
                                            )}

                                            <td className={`px-4 py-3 text-center ${viewMode === 'ledger' ? 'sticky right-0 bg-white shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] border-l-2 border-slate-300' : ''}`}>
                                                {canManageContracts ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => setEditingContract(contract)} className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors" title="Edit">
                                                            <Icon icon="solar:pen-bold" className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => confirmDelete(contract.id)} className="p-1.5 bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition-colors" title="Delete">
                                                            <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center">
                                                        {/* THE FIX: Wrapped the Icon in a span for the title attribute */}
                                                        <span title="Read Only" className="flex items-center justify-center">
                                                            <Icon icon="solar:lock-password-bold-duotone" className="w-5 h-5 text-slate-300" />
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CreateContractModal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} tenants={tenants} availableStalls={availableStalls} />
            <EditContractModal show={editingContract !== null} onClose={() => setEditingContract(null)} contract={editingContract} />
        </AuthenticatedLayout>
    );
}