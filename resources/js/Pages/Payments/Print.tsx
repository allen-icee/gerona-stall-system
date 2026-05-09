import { Head, Link } from "@inertiajs/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";

interface PaymentRow {
    month_year: string;
    amount: string | number;
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
    const TOTAL_ROWS = 29;

    // ==========================================
    // 🎛️ MASTER LAYOUT CONTROLLER 🎛️
    // ==========================================
    const LAYOUT = {
        // 1. Page Positioning (Move the whole block around the paper)
        page: {
            paddingTop: "1.32cm",
            paddingBottom: "2.7cm",
            paddingLeft: "1.35cm",
            paddingRight: "3.45cm",
        },
        // 2. The Horizontal Lines
        lines: {
            topDividerThickness: "3px", // The main line under Business Name
            topDividerMarginTop: "0px", // Space above the line
            topDividerMarginBottom: "0px", // Space below the line
            addressUnderlineThickness: "1px", // Lines under address/owner
        },
        // 3. Spacing Between Sections
        spacing: {
            aboveTitle: "0px", // Space above "STALL RENTAL"
            belowTitle: "24px", // Space below "STALL RENTAL"
            aboveTable: "24px", // Space between Address info and the Table
        },
        // 4. Table Dimensions (No more 'fr'! Use exact cm, in, or px)
        table: {
            // Adjust these to perfectly match your scanned image columns!
            columnWidths: ["3.32cm", "3.34cm", "3.36cm", "3.38cm", "auto"],
            headerHeight: "77px", // Independent header height
            rowHeight: "22px", // Height of each data row
            borderThickness: "3px", // The thick outer border of the table
        },
    };
    // ==========================================

    const [headerData, setHeaderData] = useState({
        businessName: record?.business_name || "",
        monthlyRent: record?.monthly_rent
            ? Number(record.monthly_rent).toFixed(2)
            : "",
        address: record?.address || "",
        owner: record?.owner || "",
    });

    const [rows, setRows] = useState<PaymentRow[]>([]);
    const [showGuide, setShowGuide] = useState(true);
    const [guideOpacity, setGuideOpacity] = useState(0.4);
    const [guideImage, setGuideImage] = useState("/images/scanned_rent.png");

    useEffect(() => {
        const initialRows = [...(record?.payments || [])].map((p) => ({
            month_year: p.month_year || "",
            amount: p.amount ? Number(p.amount).toFixed(2) : "",
            or_number: p.or_number || "",
            date: p.date || "",
            mode: p.mode || "",
        }));

        while (initialRows.length < TOTAL_ROWS) {
            initialRows.push({
                month_year: "",
                amount: "",
                or_number: "",
                date: "",
                mode: "",
            });
        }
        setRows(initialRows);
    }, [record]);

    const handleRowChange = (
        index: number,
        field: keyof PaymentRow,
        value: string,
    ) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const handleHeaderChange = (field: string, value: string) => {
        setHeaderData({ ...headerData, [field]: value });
    };

    const getFontSize = (text: string) => {
        if (text.length > 30) return "8pt";
        if (text.length > 20) return "10pt";
        return "12pt";
    };

    const TransparentInput = ({
        value,
        onChange,
        align = "center",
        size = "10pt",
    }: {
        value: string | number;
        onChange: (val: string) => void;
        align?: "left" | "center" | "right";
        size?: string;
    }) => (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                border: "none",
                boxShadow: "none",
                background: "transparent",
                fontSize: size,
            }}
            className={`absolute inset-0 w-full h-full p-0 m-0 text-${align} font-bold focus:ring-0 focus:outline-none focus:bg-yellow-100/50 print:bg-transparent uppercase`}
        />
    );

    return (
        <div className="min-h-screen bg-slate-500 py-10 print:py-0 print:bg-white flex flex-col items-center font-sans text-black">
            <Head title={`Print Ledger - ${headerData.owner}`} />

            <style>
                {`
                @page { size: 8.5in 25.5cm; margin: 0; }
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
                }
                `}
            </style>

            {/* Print Controls Navbar */}
            <div className="w-full max-w-[8.5in] mb-6 print:hidden space-y-4">
                <div className="flex justify-between items-center px-4">
                    <Link
                        href={route("payments.index")}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 shadow-sm"
                    >
                        <Icon icon="solar:arrow-left-bold-duotone" width="20" />{" "}
                        Back to Payments
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-black uppercase text-xs rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                        <Icon icon="solar:printer-bold-duotone" width="20" />{" "}
                        Print Ledger
                    </button>
                </div>

                <div className="mx-4 bg-slate-800 p-4 rounded-xl text-white flex items-center justify-between gap-4 border border-slate-700 shadow-lg">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="tg"
                            checked={showGuide}
                            onChange={(e) => setShowGuide(e.target.checked)}
                            className="rounded text-blue-500 w-4 h-4"
                        />
                        <label htmlFor="tg" className="text-sm font-bold">
                            Show Guide
                        </label>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={guideOpacity}
                        onChange={(e) =>
                            setGuideOpacity(parseFloat(e.target.value))
                        }
                        className="w-32"
                    />
                    <select
                        value={guideImage}
                        onChange={(e) => setGuideImage(e.target.value)}
                        className="bg-slate-700 border-none rounded text-xs font-bold py-1 px-3"
                    >
                        <option value="/images/scanned_rent.png">Page 1</option>
                        <option value="/images/scanned_rent2.png">
                            Page 2
                        </option>
                    </select>
                </div>
            </div>

            {/* MAIN PRINTABLE PAPER */}
            <div
                className="w-[8.5in] h-[25.5cm] bg-white shadow-2xl print:shadow-none relative flex flex-col"
                style={LAYOUT.page}
            >
                {/* Tracing Guide Image */}
                {showGuide && (
                    <img
                        src={guideImage}
                        alt="Tracing Guide"
                        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none print:hidden"
                        style={{ opacity: guideOpacity }}
                    />
                )}

                <div className="relative z-10 w-full h-full flex flex-col font-mono">
                    {/* TOP SECTION: Business Name & Rent */}
                    <div className="w-full mt-0 flex flex-col">
                        <div className="flex justify-between items-end px-0 h-0 relative">
                            <div className="w-[60%] flex justify-center relative h-full">
                                <TransparentInput
                                    value={headerData.businessName}
                                    onChange={(v) =>
                                        handleHeaderChange("businessName", v)
                                    }
                                    size={getFontSize(headerData.businessName)}
                                />
                            </div>
                            <div className="w-[30%] flex justify-center relative h-full">
                                <TransparentInput
                                    value={headerData.monthlyRent}
                                    onChange={(v) =>
                                        handleHeaderChange("monthlyRent", v)
                                    }
                                />
                            </div>
                        </div>

                        {/* THE LINE you wanted to control */}
                        <div
                            className="w-full border-black"
                            style={{
                                borderBottomWidth:
                                    LAYOUT.lines.topDividerThickness,
                                marginTop: LAYOUT.lines.topDividerMarginTop,
                                marginBottom:
                                    LAYOUT.lines.topDividerMarginBottom,
                            }}
                        ></div>

                        <div className="flex justify-between px-2 text-[9pt] font-sans font-bold">
                            <div className="w-[60%] text-center uppercase">
                                BUSINESS NAME
                            </div>
                            <div className="w-[30%] text-center">
                                Monthly Rent
                            </div>
                        </div>
                    </div>

                    {/* TITLE: STALL RENTAL */}
                    <div
                        className="text-center"
                        style={{
                            marginTop: LAYOUT.spacing.aboveTitle,
                            marginBottom: LAYOUT.spacing.belowTitle,
                        }}
                    >
                        <h1 className="text-[14pt] font-bold tracking-wider font-sans uppercase">
                            STALL RENTAL
                        </h1>
                    </div>

                    {/* ADDRESS & OWNER SECTION */}
                    <div className="flex justify-between text-[9pt] font-sans px-2">
                        <div className="flex items-end gap-2 w-[45%]">
                            <span className="font-bold">ADDRESS:</span>
                            <div
                                className="flex-1 border-black relative h-5"
                                style={{
                                    borderBottomWidth:
                                        LAYOUT.lines.addressUnderlineThickness,
                                }}
                            >
                                <TransparentInput
                                    value={headerData.address}
                                    onChange={(v) =>
                                        handleHeaderChange("address", v)
                                    }
                                    align="left"
                                />
                            </div>
                        </div>
                        <div className="flex items-end gap-2 w-[50%]">
                            <span className="font-bold whitespace-nowrap">
                                BUSINESS OWNER:
                            </span>
                            <div
                                className="flex-1 border-black relative h-5"
                                style={{
                                    borderBottomWidth:
                                        LAYOUT.lines.addressUnderlineThickness,
                                }}
                            >
                                <TransparentInput
                                    value={headerData.owner}
                                    onChange={(v) =>
                                        handleHeaderChange("owner", v)
                                    }
                                    align="left"
                                />
                            </div>
                        </div>
                    </div>

                    {/* PERFECTLY ALIGNED TABLE */}
                    <div
                        className="flex-1 flex flex-col overflow-hidden"
                        style={{ marginTop: LAYOUT.spacing.aboveTable }}
                    >
                        <table
                            className="w-full border-collapse border-black text-[8pt] font-bold text-center fixed-table"
                            style={{
                                borderStyle: "solid",
                                borderWidth: LAYOUT.table.borderThickness,
                                tableLayout: "fixed",
                            }}
                        >
                            {/* This <colgroup> is the magic that locks columns in place */}
                            <colgroup>
                                {LAYOUT.table.columnWidths.map((width, i) => (
                                    <col key={i} style={{ width: width }} />
                                ))}
                            </colgroup>

                            {/* Table Header */}
                            <thead className="bg-slate-50/30">
                                <tr
                                    style={{
                                        height: LAYOUT.table.headerHeight,
                                    }}
                                >
                                    {[
                                        "MONTH/YEAR",
                                        "AMOUNT",
                                        "O.R No.",
                                        "DATE",
                                        "MODE OF PAYMENT",
                                    ].map((h, i) => (
                                        <th
                                            key={i}
                                            className="border border-black p-0 align-middle"
                                        >
                                            <div className="px-1 leading-none">
                                                {h}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {rows.map((row, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            height: LAYOUT.table.rowHeight,
                                        }}
                                    >
                                        {(
                                            [
                                                "month_year",
                                                "amount",
                                                "or_number",
                                                "date",
                                                "mode",
                                            ] as const
                                        ).map((field, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className="border border-black relative p-0"
                                            >
                                                <TransparentInput
                                                    value={row[field]}
                                                    onChange={(v) =>
                                                        handleRowChange(
                                                            i,
                                                            field,
                                                            v,
                                                        )
                                                    }
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
