// resources/js/Pages/OrRecords/Print.tsx

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
        setTimeout(() => {
            window.print();
        }, 800);
    }, []);

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
            <div className="relative w-[8.5in] h-[25.5cm] bg-white font-mono text-[10pt]">

                {/* HEADER */}
                <div className="absolute top-[10mm] left-0 w-full text-center">
                    <div className="text-[10pt]">BUSINESS NAME</div>
                    <div className="text-[16pt] font-bold tracking-wide">
                        STALL RENTAL
                    </div>
                </div>

                {/* MONTHLY RENT */}
                <div className="absolute top-[10mm] right-[10mm] text-[10pt]">
                    Monthly Rent: {record.monthly_rent.toFixed(2)}
                </div>

                {/* ADDRESS */}
                <div className="absolute top-[25mm] left-[10mm] w-[90mm]">
                    <span className="mr-2">ADDRESS:</span>
                    <span className="border-b border-black inline-block w-[70mm]">
                        {record.address}
                    </span>
                </div>

                {/* OWNER */}
                <div className="absolute top-[25mm] right-[10mm] w-[90mm]">
                    <span className="mr-2">BUSINESS OWNER:</span>
                    <span className="border-b border-black inline-block w-[60mm]">
                        {record.owner}
                    </span>
                </div>

                {/* TABLE */}
                <div className="absolute top-[40mm] left-[10mm] w-[7.5in]">

                    {/* HEADER ROW */}
                    <div className="grid grid-cols-5 text-center font-bold">
                        <div className="border border-black py-[2mm]">
                            MONTH/YEAR
                        </div>
                        <div className="border border-black py-[2mm]">
                            AMOUNT
                        </div>
                        <div className="border border-black py-[2mm]">
                            O.R No.
                        </div>
                        <div className="border border-black py-[2mm]">
                            DATE
                        </div>
                        <div className="border border-black py-[2mm]">
                            MODE OF PAYMENT
                        </div>
                    </div>

                    {/* DATA ROWS */}
                    {Array.from({ length: 20 }).map((_, index) => {
                        const row = record.payments[index];

                        return (
                            <div
                                key={index}
                                className="grid grid-cols-5 text-center"
                            >
                                <div className="border border-black py-[2mm]">
                                    {row?.month_year || ""}
                                </div>

                                <div className="border border-black py-[2mm]">
                                    {row
                                        ? Number(row.amount).toFixed(2)
                                        : ""}
                                </div>

                                <div className="border border-black py-[2mm]">
                                    {row?.or_number || ""}
                                </div>

                                <div className="border border-black py-[2mm]">
                                    {row?.date || ""}
                                </div>

                                <div className="border border-black py-[2mm]">
                                    {row?.mode || ""}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}