import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

interface Props {
    id?: string;
    nextElementId?: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    error?: string;
    placeholder?: string;
    theme?: "blue" | "amber" | "rose" | "purple";
}

export default function CustomSelect({
    id,
    nextElementId,
    value,
    onChange,
    options,
    error,
    placeholder = "Select...",
    theme = "blue",
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
    const listRef = useRef<HTMLUListElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const themeStyles = {
        blue: { focus: "focus:border-blue-600 focus:ring-blue-600", activeBg: "bg-blue-50 text-blue-800 font-black" },
        amber: { focus: "focus:border-amber-500 focus:ring-amber-500", activeBg: "bg-amber-50 text-amber-900 font-black" },
        rose: { focus: "focus:border-rose-500 focus:ring-rose-500", activeBg: "bg-rose-50 text-rose-800 font-black" },
        purple: { focus: "focus:border-purple-600 focus:ring-purple-600", activeBg: "bg-purple-50 text-purple-800 font-black" },
    };

    const activeTheme = themeStyles[theme];

    useEffect(() => {
        setSelectedIndex(options.indexOf(value));
    }, [value, options]);

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setPlacement((window.innerHeight - rect.bottom < 220 && rect.top > 220) ? "top" : "bottom");
        }
        setIsOpen(!isOpen);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === " ")) {
            e.preventDefault();
            setIsOpen(true);
            return;
        }

        if (isOpen) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                onChange(options[selectedIndex]);
                setIsOpen(false);
                if (nextElementId) document.getElementById(nextElementId)?.focus();
            } else if (e.key === "Escape") {
                setIsOpen(false);
            }
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative group">
                <input
                    id={id}
                    type="text"
                    readOnly
                    value={value || ""}
                    placeholder={placeholder}
                    onClick={toggleDropdown}
                    onKeyDown={handleKeyDown}
                    className={`w-full bg-white border-2 border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-bold text-slate-900 cursor-pointer caret-transparent outline-none transition-all focus:ring-1 ${activeTheme.focus
                        } ${error ? "border-rose-600 focus:border-rose-600 focus:ring-rose-600" : ""}`}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        width="20"
                    />
                </div>
            </div>

            {isOpen && (
                <ul
                    ref={listRef}
                    className={`absolute z-[9999] w-full bg-white border-2 border-slate-300 max-h-52 overflow-y-auto shadow-2xl rounded-xl py-1.5 text-sm ${placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
                        }`}
                >
                    {options.map((opt, index) => (
                        <li
                            key={opt}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onChange(opt);
                                setIsOpen(false);
                                if (nextElementId) document.getElementById(nextElementId)?.focus();
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors uppercase tracking-tight ${index === selectedIndex || opt === value
                                ? activeTheme.activeBg
                                : "text-slate-700 font-bold hover:bg-slate-50"
                                }`}
                        >
                            <span>{opt}</span>
                            {(index === selectedIndex || opt === value) && (
                                <Icon icon="solar:check-circle-bold" width="18" className="text-blue-600" />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}