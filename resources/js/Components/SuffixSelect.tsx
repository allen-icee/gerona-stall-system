//resources\js\Components\SuffixSelect.tsx
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    theme?: "blue" | "amber" | "rose" | "purple" | "emerald" | "fuchsia"; // Added theme here!
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SUFFIXES = ["", "JR.", "SR.", "I", "II", "III", "IV", "V"];

export default function SuffixSelect({
    value,
    onChange,
    error,
    theme = "blue",
    onKeyDown,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    const themeStyles = {
        blue: {
            focus: "focus:border-blue-600 focus:ring-blue-600",
            activeBg: "bg-blue-100 text-blue-800 font-black",
        },
        amber: {
            focus: "focus:border-amber-500 focus:ring-amber-500",
            activeBg: "bg-amber-100 text-amber-900 font-black",
        },
        rose: {
            focus: "focus:border-rose-500 focus:ring-rose-500",
            activeBg: "bg-rose-100 text-rose-900 font-black",
        },
        purple: {
            focus: "focus:border-purple-600 focus:ring-purple-600",
            activeBg: "bg-purple-100 text-purple-900 font-black",
        },
        emerald: {
            focus: "focus:border-emerald-600 focus:ring-emerald-600",
            activeBg: "bg-emerald-100 text-emerald-900 font-black",
        },
        fuchsia: {
            focus: "focus:border-fuchsia-500 focus:ring-fuchsia-500",
            activeBg: "bg-fuchsia-100 text-fuchsia-900 font-black",
        },
    };

    const activeTheme = themeStyles[theme];

    useEffect(() => {
        setSelectedIndex(SUFFIXES.indexOf(value));
    }, [value]);

    useEffect(() => {
        if (isOpen && listRef.current && selectedIndex >= 0) {
            const list = listRef.current;
            const element = list.children[selectedIndex] as HTMLElement;
            if (element) {
                const blockStart = list.scrollTop;
                const blockEnd = list.scrollTop + list.clientHeight;
                const elStart = element.offsetTop;
                const elEnd = element.offsetTop + element.clientHeight;

                if (elStart < blockStart) {
                    list.scrollTop = elStart;
                } else if (elEnd > blockEnd) {
                    list.scrollTop = elEnd - list.clientHeight;
                }
            }
        }
    }, [selectedIndex, isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setIsOpen(true);
            return;
        }

        if (isOpen) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < SUFFIXES.length - 1 ? prev + 1 : prev,
                );
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                return;
            }
            if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                onChange(SUFFIXES[selectedIndex]);
                setIsOpen(false);
                return;
            }
            if (e.key === "Escape") {
                setIsOpen(false);
                return;
            }
        }

        if (onKeyDown) onKeyDown(e);
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    className={`w-full bg-white border-2 border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 cursor-pointer caret-transparent outline-none transition-all focus:ring-1 ${activeTheme.focus} placeholder-slate-400 ${error ? "border-rose-600 focus:border-rose-600 focus:ring-rose-600" : ""}`}
                    value={value || "N/A"}
                    onClick={() => setIsOpen(true)}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    onKeyDown={handleKeyDown}
                    onChange={() => {}}
                    readOnly
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        width="20"
                    />
                </div>
            </div>

            {isOpen && (
                <ul
                    ref={listRef}
                    className="absolute z-[9999] w-full bg-white border-2 border-slate-300 mt-2 max-h-48 overflow-y-auto shadow-2xl rounded-xl text-sm py-1.5"
                >
                    {SUFFIXES.map((opt, index) => (
                        <li
                            key={opt}
                            className={`px-4 py-2.5 cursor-pointer text-slate-700 font-bold transition-colors ${
                                index === selectedIndex
                                    ? activeTheme.activeBg
                                    : "hover:bg-slate-100 hover:text-slate-900"
                            }`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange(opt);
                                setIsOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            {opt === "" ? "N/A" : opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
