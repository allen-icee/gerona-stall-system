import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Icon } from "@iconify/react";

interface Props {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    theme?: "blue" | "amber" | "rose" | "purple";
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export default function SearchableSelect({
    id,
    value,
    onChange,
    options,
    placeholder = "Select an option...",
    disabled = false,
    error,
    theme = "blue",
    onKeyDown,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const themeStyles = {
        blue: { focus: "focus:border-blue-600 focus:ring-blue-600", activeBg: "bg-blue-50 text-blue-700 font-black", highlightBg: "bg-blue-100/50" },
        amber: { focus: "focus:border-amber-500 focus:ring-amber-500", activeBg: "bg-amber-50 text-amber-700 font-black", highlightBg: "bg-amber-100/50" },
        rose: { focus: "focus:border-rose-500 focus:ring-rose-500", activeBg: "bg-rose-50 text-rose-700 font-black", highlightBg: "bg-rose-100/50" },
        purple: { focus: "focus:border-purple-600 focus:ring-purple-600", activeBg: "bg-purple-50 text-purple-700 font-black", highlightBg: "bg-purple-100/50" },
    };

    const activeTheme = themeStyles[theme];

    // Sync searchTerm when value changes externally
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(value); // Reset search to current value
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    // Auto-scroll to highlighted item
    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const listItems = listRef.current.querySelectorAll("li");
            const activeItem = listItems[highlightedIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }, [highlightedIndex, isOpen]);

    const openDropdown = () => {
        if (disabled) return;
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setPlacement((window.innerHeight - rect.bottom < 250 && rect.top > 250) ? "top" : "bottom");
        }
        setIsOpen(true);
    };

    const handleSelect = (opt: string) => {
        onChange(opt);
        setSearchTerm(opt);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInternalKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (onKeyDown) onKeyDown(e);

        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter") {
                e.preventDefault();
                openDropdown();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex(prev => prev < filteredOptions.length - 1 ? prev + 1 : prev);
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex]);
                } else if (filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setSearchTerm(value);
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    id={id}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setHighlightedIndex(-1);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={openDropdown}
                    onKeyDown={handleInternalKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete="off"
                    // pl-10 matches your modal's icon spacing
                    className={`w-full bg-white border-2 border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-1 ${activeTheme.focus
                        } ${error ? "border-rose-600 focus:border-rose-600 focus:ring-rose-600" : ""} 
                    disabled:opacity-50 disabled:bg-slate-50`}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        width="20"
                    />
                </div>
            </div>

            {isOpen && !disabled && (
                <ul
                    ref={listRef}
                    className={`absolute z-[9999] w-full bg-white border-2 border-slate-300 max-h-52 overflow-y-auto shadow-2xl rounded-xl py-1.5 text-sm hide-scrollbar ${placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
                        }`}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, index) => (
                            <li
                                key={opt}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(opt);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${value === opt
                                    ? activeTheme.activeBg
                                    : index === highlightedIndex
                                        ? `${activeTheme.highlightBg} text-slate-900 font-bold`
                                        : "text-slate-700 font-bold hover:bg-slate-50"
                                    }`}
                            >
                                <span className="truncate uppercase tracking-tight">{opt}</span>
                                {value === opt && (
                                    <Icon icon="solar:check-circle-bold" width="18" className="text-blue-600" />
                                )}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-6 text-slate-400 text-center flex flex-col items-center gap-2">
                            <Icon icon="solar:minimalistic-magnifer-zoom-out-bold" width="28" className="opacity-20" />
                            <span className="font-bold text-xs uppercase">No matches found</span>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}