// resources\js\Pages\Payments\Print.tsx

import { Head } from "@inertiajs/react";
import { useEffect } from "react";

interface PaymentRow {
    month_year: string;
    amount: number;
    or_number: string;
    date: string;
    mode: string;
}

interface Props {
    record: {
        business_name: string;
        address: string;
        owner: string;
        monthly_rent: number;
        payments: PaymentRow[];
    };
}

export default function Print({ record }: Props) {
    useEffect(() => {
        setTimeout(() => window.print(), 800);
    }, []);

    const rows = Array.from({ length: 28 });

    const Cell = ({ value = "" }: { value?: string }) => (
        <div className="border-r border-black h-[22px] flex items-center px-1">
            <div className="w-full h-[16px] border border-gray-400 flex items-center px-1 text-[9pt]">
                {value}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-500 min-h-screen flex justify-center print:bg-white">
            <Head title="Print Stall Rental OR" />

            <style>
                {`
                @page {
                    size: 8.5in 25.5cm;
                    margin: 0;
                }

                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
                `}
            </style>

            {/* PAPER */}
            <div className="w-[8.5in] h-[25.5cm] bg-white border border-black p-4 flex flex-col font-mono text-[10pt]">
                {/* HEADER */}
                <div className="relative text-center border-b border-black pb-2">
                    <div className="text-[10pt]">BUSINESS NAME</div>
                    <div className="text-[16pt] font-bold tracking-wide">
                        STALL RENTAL
                    </div>

                    {/* Monthly Rent */}
                    <div className="absolute right-0 top-0 flex items-center gap-2 text-[10pt]">
                        <span>Monthly Rent</span>
                        <div className="w-28 h-5 border-b border-black flex items-center justify-end pr-1">
                            {record.monthly_rent.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* INFO ROW */}
                <div className="flex justify-between mt-3 text-[10pt]">
                    <div className="flex items-center gap-2 w-1/2">
                        <span>ADDRESS:</span>
                        <div className="flex-1 h-5 border-b border-black flex items-center px-1">
                            {record.address}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-1/2 pl-4">
                        <span>BUSINESS OWNER:</span>
                        <div className="flex-1 h-5 border-b border-black flex items-center px-1">
                            {record.owner}
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="mt-4 border border-black flex-1 flex flex-col">
                    {/* HEADER */}
                    <div className="grid grid-cols-5 text-center text-[10pt] font-bold border-b border-black">
                        {[
                            "MONTH/YEAR",
                            "AMOUNT",
                            "O.R No.",
                            "DATE",
                            "MODE OF PAYMENT",
                        ].map((h, i) => (
                            <div
                                key={i}
                                className="border-r border-black py-2 px-1"
                            >
                                <div className="border border-gray-400 py-1">
                                    {h}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* BODY */}
                    <div className="flex-1 flex flex-col">
                        {rows.map((_, i) => {
                            const row = record.payments[i];

                            return (
                                <div
                                    key={i}
                                    className="grid grid-cols-5 border-b border-black"
                                >
                                    <Cell value={row?.month_year || ""} />
                                    <Cell
                                        value={row ? row.amount.toFixed(2) : ""}
                                    />
                                    <Cell value={row?.or_number || ""} />
                                    <Cell value={row?.date || ""} />
                                    <Cell value={row?.mode || ""} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
