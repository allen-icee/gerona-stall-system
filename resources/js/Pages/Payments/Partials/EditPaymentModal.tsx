import { useEffect, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import Modal from "@/Components/Modal";
import CustomSelect from "@/Components/CustomSelect";
import { useEnterTab } from "@/hooks/useEnterTab";

export default function EditPaymentModal({ show, onClose, payment }: any) {
    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            amount: "",
            payment_date: "",
            month: "",
            year: new Date().getFullYear(),
            or_number: "",
        });

    const formRef = useRef<HTMLFormElement>(null);
    useEnterTab(formRef);

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

    useEffect(() => {
        if (payment) {
            setData({
                amount: payment.amount || "",
                payment_date: payment.payment_date || "",
                month: payment.month || "",
                year: payment.year || new Date().getFullYear(),
                or_number: payment.or_number || "",
            });
        }
    }, [payment]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("payments.update", payment?.id), {
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
                    Edit Official Receipt
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
                className="p-6 space-y-5 bg-white rounded-b-2xl"
            >
                {/* Read-only Context */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wide mb-2">
                        Payer Information (Locked)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">
                                Tenant
                            </p>
                            <p className="text-sm font-black text-slate-800">
                                {payment?.contract?.tenant?.first_name}{" "}
                                {payment?.contract?.tenant?.last_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">
                                Stall Code
                            </p>
                            <p className="text-sm font-black text-slate-800">
                                {payment?.contract?.stall?.stall_code}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wide block cursor-pointer">
                                OR Number
                            </label>
                            <span
                                className={`text-[10px] font-bold ${data.or_number?.length >= 255 ? "text-rose-600" : "text-slate-400"}`}
                            >
                                {data.or_number?.length || 0}/255
                            </span>
                        </div>
                        <input
                            type="text"
                            maxLength={255}
                            value={data.or_number}
                            onChange={(e) =>
                                setData("or_number", e.target.value)
                            }
                            className="w-full bg-amber-50 border-2 border-amber-300 rounded-lg px-4 py-2.5 text-sm font-black text-amber-900 focus:border-amber-600 focus:ring-0 placeholder:font-normal placeholder:text-amber-300 transition-colors"
                            required
                        />
                        {errors.or_number && (
                            <p className="text-rose-500 text-xs font-bold mt-1">
                                {errors.or_number}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-20">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                            Date of Payment
                        </label>
                        <input
                            type="date"
                            value={data.payment_date}
                            onChange={(e) =>
                                setData("payment_date", e.target.value)
                            }
                            className="w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors cursor-pointer"
                            required
                        />
                    </div>
                    <div className="z-30">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                            For Month
                        </label>
                        <CustomSelect
                            value={data.month}
                            onChange={(val: any) => setData("month", val)}
                            options={months.map((m) => ({
                                value: m,
                                label: m,
                            }))}
                            placeholder="Select Month"
                            theme="amber"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block cursor-pointer">
                            For Year
                        </label>
                        <input
                            type="number"
                            value={data.year}
                            onChange={(e) =>
                                setData("year", parseInt(e.target.value))
                            }
                            className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-0 transition-colors"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-100">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-2.5 rounded-lg font-black uppercase text-xs text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-black uppercase text-xs disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                    >
                        Update Receipt
                    </button>
                </div>
            </form>
        </Modal>
    );
}
