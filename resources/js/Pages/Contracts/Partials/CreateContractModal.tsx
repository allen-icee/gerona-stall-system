import { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import SearchableSelect from "@/Components/SearchableSelect";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function CreateContractModal({
    show,
    onClose,
    tenants,
    availableStalls,
}: any) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            tenant_id: "",
            stall_id: "",
            start_date: "",
            end_date: "",
            monthly_rent: "",
            security_deposit: "",
            document_status: "For Contract",
            permit_status: "Waiting",
            deposit_paid: "",
            deposit_reference: "",
            remarks: "",
        });

    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

    const [isRentLocked, setIsRentLocked] = useState(true);
    // 🔥 Formatted Tenant Options
    const tenantOptions =
        tenants?.map((t: any) => ({
            value: t.id,
            searchString: `${t.first_name} ${t.last_name} ${t.company_name || ""}`,
            label: (
                <div className="flex flex-col justify-center w-full overflow-hidden text-left py-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5 truncate">
                        {t.company_name || "Individual/Personal"}
                    </span>
                    <span className="text-sm font-black text-blue-700 uppercase leading-none truncate">
                        {t.first_name} {t.last_name}
                    </span>
                </div>
            ),
        })) || [];

    // 🔥 Formatted Stall Options (forces UPPERCASE for stall codes)
    const stallOptions =
        availableStalls?.map((s: any) => ({
            value: s.id,
            searchString: `${s.stall_code} ${s.floor?.building?.name || ""}`,
            label: (
                <div className="flex flex-col justify-center w-full overflow-hidden text-left py-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5 truncate">
                        {s.floor?.building?.name || "No Building"} -{" "}
                        {s.floor?.name || "No Floor"}
                    </span>
                    <span className="text-sm font-black text-amber-600 uppercase leading-none truncate">
                        {String(s.stall_code || "").toUpperCase()}
                    </span>
                </div>
            ),
        })) || [];
    useEffect(() => {
        if (data.stall_id) {
            const selectedStall = availableStalls.find(
                (s: any) => s.id === data.stall_id,
            );
            if (
                selectedStall &&
                selectedStall.computed_monthly_rent !== undefined
            ) {
                const rent = parseFloat(
                    selectedStall.computed_monthly_rent,
                ).toFixed(2);
                setData((prev) => ({
                    ...prev,
                    monthly_rent: rent,
                    security_deposit: rent, // Set deposit equal to 1 month rent default
                }));
                setIsRentLocked(true);
            }
        }
    }, [data.stall_id, availableStalls]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("contracts.store"), { onSuccess: () => closeModal() });
    };

    const closeModal = () => {
        onClose();
        clearErrors();
        reset();
        setIsRentLocked(true);
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="3xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon
                        icon="solar:document-add-bold-duotone"
                        className="w-6 h-6 text-blue-700"
                    />
                    Draft Lease Contract
                </h2>
                <button
                    onClick={closeModal}
                    className="text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <Icon
                        icon="solar:close-circle-bold-duotone"
                        className="w-6 h-6"
                    />
                </button>
            </div>

            <form
                ref={formRef}
                onSubmit={submit}
                className="p-6 space-y-6 bg-white rounded-b-2xl overflow-y-auto max-h-[80vh] custom-scrollbar"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Tenant Select */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                            Assign to Tenant
                        </label>
                        <SearchableSelect
                            value={data.tenant_id}
                            onChange={(val: any) => setData("tenant_id", val)}
                            options={tenantOptions}
                            placeholder="Search registered tenants..."
                            error={errors.tenant_id}
                        />
                        {errors.tenant_id && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.tenant_id}
                            </p>
                        )}
                    </div>

                    {/* Stall Select */}
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                            Available Stall
                        </label>
                        <SearchableSelect
                            value={data.stall_id}
                            onChange={(val: any) => setData("stall_id", val)}
                            options={stallOptions}
                            placeholder="Search vacant stalls..."
                            error={errors.stall_id}
                            theme="amber"
                        />
                        {errors.stall_id && (
                            <p className="text-rose-600 text-xs font-bold mt-1.5">
                                {errors.stall_id}
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:calendar-date-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Basic Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-bold focus:border-blue-600 focus:ring-0"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-bold focus:border-blue-600 focus:ring-0"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-wide cursor-pointer">
                                    Monthly Rent (₱)
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsRentLocked(!isRentLocked)
                                    }
                                    className="text-slate-400 hover:text-blue-600 focus:outline-none transition-colors"
                                    title={
                                        isRentLocked
                                            ? "Unlock to edit"
                                            : "Lock price"
                                    }
                                >
                                    <Icon
                                        icon={
                                            isRentLocked
                                                ? "solar:lock-password-bold-duotone"
                                                : "solar:unlock-bold-duotone"
                                        }
                                        className="w-4 h-4"
                                    />
                                </button>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={data.monthly_rent}
                                onChange={(e) =>
                                    setData("monthly_rent", e.target.value)
                                }
                                readOnly={isRentLocked}
                                className={`w-full border-2 rounded-lg px-4 py-2 text-sm font-black transition-colors focus:ring-0 ${isRentLocked ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" : "bg-white border-blue-400 text-blue-900 focus:border-blue-600"}`}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                Security Deposit (Bond)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.security_deposit}
                                onChange={(e) =>
                                    setData("security_deposit", e.target.value)
                                }
                                className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2 text-sm font-black focus:border-blue-600 focus:ring-0"
                                placeholder="₱ 0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:wallet-money-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Treasury Data (Initial Payment)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-emerald-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Actual Deposit (Advance Rent)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.deposit_paid}
                                onChange={(e) =>
                                    setData("deposit_paid", e.target.value)
                                }
                                className="w-full bg-white border-2 border-emerald-300 rounded-lg px-4 py-2 text-sm font-black text-emerald-900 focus:border-emerald-600 focus:ring-0"
                                placeholder="₱ 0.00"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-xs font-black text-emerald-900 uppercase tracking-wide block cursor-pointer">
                                    O.R. / Reference #
                                </label>
                                <span
                                    className={`text-[10px] font-bold ${data.deposit_reference?.length >= 255 ? "text-rose-600" : "text-slate-400"}`}
                                >
                                    {data.deposit_reference?.length || 0}/255
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={255}
                                value={data.deposit_reference}
                                onChange={(e) =>
                                    setData("deposit_reference", e.target.value)
                                }
                                className="w-full bg-white border-2 border-emerald-300 rounded-lg px-4 py-2 text-sm font-bold text-emerald-900 focus:border-emerald-600 focus:ring-0"
                                placeholder="e.g. OR-12345"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:folder-with-files-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        EEDO / Admin Operations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-blue-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Document Status
                            </label>
                            <select
                                value={data.document_status}
                                onChange={(e) =>
                                    setData("document_status", e.target.value)
                                }
                                className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-2 text-sm font-bold text-blue-900 focus:border-blue-600 focus:ring-0 cursor-pointer"
                            >
                                <option value="For Contract">
                                    For Contract
                                </option>
                                <option value="For Signing">For Signing</option>
                                <option value="Signed">Signed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-blue-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Permit Status
                            </label>
                            <select
                                value={data.permit_status}
                                onChange={(e) =>
                                    setData("permit_status", e.target.value)
                                }
                                className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-2 text-sm font-bold text-blue-900 focus:border-blue-600 focus:ring-0 cursor-pointer"
                            >
                                <option value="Waiting">
                                    Waiting for Permit
                                </option>
                                <option value="On Process">On Process</option>
                                <option value="For Confirmation">
                                    For Confirmation
                                </option>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Valid">Valid</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex justify-between items-end mb-1">
                                <label className="text-xs font-black text-blue-900 uppercase tracking-wide block cursor-pointer">
                                    Remarks
                                </label>
                                <span
                                    className={`text-[10px] font-bold ${data.remarks?.length >= 255 ? "text-rose-600" : "text-slate-400"}`}
                                >
                                    {data.remarks?.length || 0}/255
                                </span>
                            </div>
                            <textarea
                                maxLength={255}
                                value={data.remarks}
                                onChange={(e) =>
                                    setData("remarks", e.target.value)
                                }
                                rows={2}
                                className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-2 text-sm font-bold text-blue-900 focus:border-blue-600 focus:ring-0 custom-scrollbar"
                                placeholder="Add notes about this contract..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t-2 border-slate-100">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Finalize Contract
                    </button>
                </div>
            </form>
        </Modal>
    );
}
