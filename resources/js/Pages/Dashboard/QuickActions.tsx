import { Link } from "@inertiajs/react";
import { Icon } from "@iconify/react";

export default function QuickActions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Link
                href={route("tenants.index")}
                className="flex flex-col items-center justify-center p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group"
            >
                <div className="bg-blue-50 p-3 rounded-xl mb-3 group-hover:scale-110 group-hover:bg-blue-100 transition-all border border-blue-100">
                    <Icon
                        icon="solar:user-plus-bold-duotone"
                        className="w-8 h-8 text-blue-600"
                    />
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">
                    Add Tenant
                </span>
            </Link>

            <Link
                href={route("contracts.index")}
                className="flex flex-col items-center justify-center p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all group"
            >
                <div className="bg-amber-50 p-3 rounded-xl mb-3 group-hover:scale-110 group-hover:bg-amber-100 transition-all border border-amber-100">
                    <Icon
                        icon="solar:document-add-bold-duotone"
                        className="w-8 h-8 text-amber-500"
                    />
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">
                    Draft Contract
                </span>
            </Link>

            <Link
                href={route("payments.index")}
                className="flex flex-col items-center justify-center p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all group"
            >
                <div className="bg-emerald-50 p-3 rounded-xl mb-3 group-hover:scale-110 group-hover:bg-emerald-100 transition-all border border-emerald-100">
                    <Icon
                        icon="solar:wallet-money-bold-duotone"
                        className="w-8 h-8 text-emerald-600"
                    />
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">
                    Record Payment
                </span>
            </Link>

            <Link
                href={route("layouts.mapper")}
                className="flex flex-col items-center justify-center p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-purple-400 hover:shadow-md transition-all group"
            >
                <div className="bg-purple-50 p-3 rounded-xl mb-3 group-hover:scale-110 group-hover:bg-purple-100 transition-all border border-purple-100">
                    <Icon
                        icon="solar:map-bold-duotone"
                        className="w-8 h-8 text-purple-600"
                    />
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">
                    Stall Map
                </span>
            </Link>
        </div>
    );
}
