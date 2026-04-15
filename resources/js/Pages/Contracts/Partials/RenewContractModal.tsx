import { useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function RenewContractModal({ show, onClose, contract }: any) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        stall_id: "",
        tenant_id: "",
        start_date: "",
        end_date: "",
        monthly_rent: "",
        security_deposit: "",
        document_status: "For Contract",
        permit_status: "Waiting",
        deposit_paid: "",
        deposit_reference: "",
        remarks: "Contract Renewal",

        // Tells the backend to trigger the smart renewal engine!
        is_renewal: true,
        old_contract_id: ""
    });

    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

    // Calculate if the grace period has passed (24 Hours)
    const isLate = contract ? new Date() > new Date(new Date(contract.end_date).getTime() + (24 * 60 * 60 * 1000)) : false;

    useEffect(() => {
        if (contract) {
            setData({
                stall_id: contract.stall_id,
                tenant_id: contract.tenant_id,
                start_date: "",
                end_date: "",
                monthly_rent: contract.monthly_rent || "",
                security_deposit: contract.security_deposit || "",
                document_status: "For Contract",
                permit_status: "Waiting",
                deposit_paid: "",
                deposit_reference: "",
                remarks: "Contract Renewal",
                is_renewal: true,
                old_contract_id: contract.id
            });
        }
    }, [contract]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("contracts.store"), { onSuccess: () => closeModal() });
    };

    const closeModal = () => {
        onClose();
        clearErrors();
        reset();
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="3xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon icon="solar:restart-circle-bold-duotone" className="w-6 h-6 text-emerald-600" />
                    Renew Lease Contract
                </h2>
                <button onClick={closeModal} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6" />
                </button>
            </div>

            <form ref={formRef} onSubmit={submit} className="p-6 space-y-6 bg-white rounded-b-2xl overflow-y-auto max-h-[80vh] custom-scrollbar">

                {/* Penalty Warning Banner */}
                {isLate && (
                    <div className="bg-rose-100 border-2 border-rose-400 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-pulse">
                        <Icon icon="solar:danger-triangle-bold" className="w-6 h-6 text-rose-600 shrink-0" />
                        <div>
                            <h3 className="text-sm font-black text-rose-800 uppercase tracking-wide">Late Renewal Penalty Alert</h3>
                            <p className="text-xs font-bold text-rose-700 mt-0.5">
                                This renewal is past the 24-hour grace period. A <strong>20% Penalty</strong> will be automatically applied to the new monthly rent upon saving.
                            </p>
                        </div>
                    </div>
                )}

                {/* Read-Only Entity Information */}
                <div className="bg-slate-800 border-2 border-slate-900 rounded-xl p-4 shadow-inner text-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2 flex justify-between">
                        <span>Linked Entities (Carried Over)</span>
                        <span className="text-emerald-400">Old Contract Will Be Archived</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-emerald-400 uppercase font-bold">Tenant</p>
                            <p className="text-sm font-black text-white">
                                {contract?.tenant?.first_name} {contract?.tenant?.last_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-emerald-400 uppercase font-bold">Stall Code</p>
                            {/* 🔥 Forces the stall code to be uppercase */}
                            <p className="text-sm font-black text-white">
                                {String(contract?.stall?.stall_code || "").toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* General Form Error Alert */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-rose-50 border-2 border-rose-200 p-3 rounded-lg flex items-center gap-2">
                        <Icon icon="solar:danger-circle-bold" className="text-rose-500 w-5 h-5" />
                        <span className="text-sm font-bold text-rose-700">Please fix the errors below before submitting.</span>
                    </div>
                )}

                <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon icon="solar:calendar-date-bold-duotone" className="w-4 h-4" /> New Terms & Fees
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">New Start Date</label>
                            <input type="date" value={data.start_date} onChange={(e) => setData("start_date", e.target.value)} className={`w-full bg-white border-2 rounded-lg px-4 py-2 text-sm font-bold focus:ring-0 ${errors.start_date ? 'border-rose-500 focus:border-rose-600' : 'border-emerald-300 focus:border-emerald-600'}`} required />
                            {errors.start_date && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.start_date}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">New End Date</label>
                            <input type="date" value={data.end_date} onChange={(e) => setData("end_date", e.target.value)} className={`w-full bg-white border-2 rounded-lg px-4 py-2 text-sm font-bold focus:ring-0 ${errors.end_date ? 'border-rose-500 focus:border-rose-600' : 'border-emerald-300 focus:border-emerald-600'}`} required />
                            {errors.end_date && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.end_date}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">Base Monthly Rent (₱)</label>
                            <input type="number" step="0.01" value={data.monthly_rent} onChange={(e) => setData("monthly_rent", e.target.value)} className={`w-full bg-white border-2 rounded-lg px-4 py-2 text-sm font-black focus:ring-0 ${errors.monthly_rent ? 'border-rose-500 focus:border-rose-600' : 'border-emerald-300 focus:border-emerald-600'}`} required />
                            {errors.monthly_rent && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.monthly_rent}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">Security Deposit (Bond)</label>
                            <input type="number" step="0.01" value={data.security_deposit} onChange={(e) => setData("security_deposit", e.target.value)} className={`w-full bg-white border-2 rounded-lg px-4 py-2 text-sm font-black focus:ring-0 ${errors.security_deposit ? 'border-rose-500 focus:border-rose-600' : 'border-emerald-300 focus:border-emerald-600'}`} placeholder="₱ 0.00" />
                            {errors.security_deposit && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase">{errors.security_deposit}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t-2 border-slate-100">
                    <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button type="submit" disabled={processing} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm">Process Renewal</button>
                </div>
            </form>
        </Modal>
    );
}