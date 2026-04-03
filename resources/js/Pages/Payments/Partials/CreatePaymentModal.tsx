import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";

export default function CreatePaymentModal({
    show,
    onClose,
    activeContracts,
}: {
    show: boolean;
    onClose: () => void;
    activeContracts: any[];
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            contract_id: "",
            amount: "",
            payment_date: new Date().toISOString().split("T")[0],
            month: "",
            year: new Date().getFullYear(),
            or_number: "",
        });

    const months = [
        "JANUARY",
        "FEBRUARY",
        "MARCH",
        "APRIL",
        "MAY",
        "JUNE",
        "JULY",
        "AUGUST",
        "SEPTEMBER",
        "OCTOBER",
        "NOVEMBER",
        "DECEMBER",
    ];

    // Auto-fill amount logic
    useEffect(() => {
        if (data.contract_id) {
            const selectedContract = activeContracts.find(
                (c: any) => c.id == data.contract_id,
            );
            if (selectedContract)
                setData("amount", selectedContract.monthly_rent);
        }
    }, [data.contract_id, activeContracts]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("payments.store"), { onSuccess: () => closeModal() });
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
                        icon="solar:wallet-money-bold-duotone"
                        className="w-6 h-6 text-emerald-600"
                    />
                    Issue Official Receipt
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
                onSubmit={submit}
                className="p-6 space-y-5 bg-white rounded-b-2xl"
            >
                <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                        Find Active Contract / Tenant
                    </label>
                    <select
                        value={data.contract_id}
                        onChange={(e) => setData("contract_id", e.target.value)}
                        className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 cursor-pointer transition-colors"
                        required
                    >
                        <option value="">-- Select Payer --</option>
                        {activeContracts.map((c: any) => (
                            <option key={c.id} value={c.id}>
                                {c.tenant?.first_name} {c.tenant?.last_name} |{" "}
                                {c.stall?.stall_code} -{" "}
                                {c.stall?.building?.name}
                            </option>
                        ))}
                    </select>
                    {errors.contract_id && (
                        <p className="text-rose-500 text-xs font-bold mt-1">
                            {errors.contract_id}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            OR Number
                        </label>
                        <input
                            type="text"
                            value={data.or_number}
                            onChange={(e) =>
                                setData("or_number", e.target.value)
                            }
                            className="w-full bg-amber-50 border-2 border-amber-300 rounded-lg px-4 py-2.5 text-sm font-black text-amber-900 focus:border-amber-600 focus:ring-0 placeholder:font-normal placeholder:text-amber-300 transition-colors"
                            placeholder="Enter Receipt Number"
                            required
                        />
                        {errors.or_number && (
                            <p className="text-rose-500 text-xs font-bold mt-1">
                                {errors.or_number}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Amount Paid (₱)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-black text-slate-900 focus:border-emerald-600 focus:ring-0 transition-colors"
                            required
                        />
                        {errors.amount && (
                            <p className="text-rose-500 text-xs font-bold mt-1">
                                {errors.amount}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            Date of Payment
                        </label>
                        <input
                            type="date"
                            value={data.payment_date}
                            onChange={(e) =>
                                setData("payment_date", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            For Month
                        </label>
                        <select
                            value={data.month}
                            onChange={(e) => setData("month", e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 cursor-pointer transition-colors"
                            required
                        >
                            <option value="">-- Month --</option>
                            {months.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">
                            For Year
                        </label>
                        <input
                            type="number"
                            value={data.year}
                            onChange={(e) =>
                                setData("year", parseInt(e.target.value))
                            }
                            className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-0 transition-colors"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
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
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm"
                    >
                        Save Official Receipt
                    </button>
                </div>
            </form>
        </Modal>
    );
}
