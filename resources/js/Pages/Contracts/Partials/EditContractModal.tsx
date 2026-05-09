import { useState, useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function EditContractModal({ show, onClose, contract }: any) {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            start_date: "",
            end_date: "",
            due_day: 31,
            monthly_rent: "",
        });

    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);
    const [isRentLocked, setIsRentLocked] = useState(true);

    useEffect(() => {
        if (contract) {
            setData({
                start_date: contract.start_date || "",
                end_date: contract.end_date || "",
                due_day: contract.due_day || 31,
                monthly_rent: contract.monthly_rent || "",
            });
            setIsRentLocked(true);
        }
    }, [contract]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("contracts.update", contract?.id), {
            onSuccess: () => closeModal(),
        });
    };

    const closeModal = () => {
        onClose();
        clearErrors();
        reset();
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="2xl">
            <div className="px-6 py-4 bg-slate-200 border-b-2 border-slate-300 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                    <Icon
                        icon="solar:pen-bold-duotone"
                        className="w-6 h-6 text-amber-500"
                    />
                    Edit Assignment
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
                <div className="bg-slate-800 border-2 border-slate-900 rounded-xl p-4 shadow-inner text-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">
                        Linked Entities (Read-Only)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-amber-400 uppercase font-bold">
                                Tenant
                            </p>
                            <p className="text-sm font-black text-white">
                                {contract?.tenant?.first_name}{" "}
                                {contract?.tenant?.last_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-amber-400 uppercase font-bold">
                                Stall Code
                            </p>
                            <p className="text-sm font-black text-white">
                                {String(
                                    contract?.stall?.stall_code || "",
                                ).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200">
                    <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Icon
                            icon="solar:calendar-date-bold-duotone"
                            className="w-4 h-4"
                        />{" "}
                        Assignment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) =>
                                    setData("start_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-amber-300 rounded-lg px-4 py-2 text-sm font-bold focus:border-amber-600 focus:ring-0"
                                required
                            />
                            {errors.start_date && (
                                <p className="text-rose-600 text-xs font-bold mt-1">
                                    {errors.start_date}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1 block cursor-pointer">
                                End Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) =>
                                    setData("end_date", e.target.value)
                                }
                                className="w-full bg-white border-2 border-amber-300 rounded-lg px-4 py-2 text-sm font-bold focus:border-amber-600 focus:ring-0"
                            />
                            {errors.end_date && (
                                <p className="text-rose-600 text-xs font-bold mt-1">
                                    {errors.end_date}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-black text-amber-900 uppercase tracking-wide cursor-pointer">
                                    Monthly Rent (₱)
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsRentLocked(!isRentLocked)
                                    }
                                    className="text-amber-500 hover:text-amber-700 focus:outline-none transition-colors"
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
                                className={`w-full border-2 rounded-lg px-4 py-2 text-sm font-black transition-colors focus:ring-0 ${isRentLocked ? "bg-amber-100 border-amber-200 text-amber-700 cursor-not-allowed" : "bg-white border-amber-400 text-amber-900 focus:border-amber-600"}`}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                                Billing Due Day
                            </label>
                            <select
                                value={data.due_day}
                                onChange={(e) =>
                                    setData("due_day", parseInt(e.target.value))
                                }
                                className="w-full bg-white border-2 border-amber-300 rounded-lg px-4 py-2 text-sm font-bold focus:border-amber-600 focus:ring-0 cursor-pointer"
                                required
                            >
                                <option value={15}>15th of the Month</option>
                                <option value={31}>
                                    End of the Month (Last Day)
                                </option>
                            </select>
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
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Update Assignment
                    </button>
                </div>
            </form>
        </Modal>
    );
}
