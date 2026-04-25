//resources/js/Components/CustomSelect.tsx
import { useState, useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

export interface SelectOption {
    value: string | number;
    label: string;
}

interface Props {
    id?: string;
    nextElementId?: string;
    value: string | number | undefined | null;
    onChange: (value: any) => void;
    options: string[] | SelectOption[];
    error?: string;
    placeholder?: string;
    theme?: "amber" | "blue" | "rose" | "purple" | "emerald";
    disabled?: boolean;
    children?: ReactNode; // 🔥 Added to suppress TS error
    className?: string; // 🔥 Added to suppress TS error
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
    disabled = false,
    children,
    className = "",
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const themeStyles = {
        blue: {
            focus: "focus:border-blue-600 focus:ring-blue-600",
            activeBg: "bg-blue-50 text-blue-800 font-black",
            icon: "text-blue-600",
        },
        amber: {
            focus: "focus:border-amber-500 focus:ring-amber-500",
            activeBg: "bg-amber-50 text-amber-900 font-black",
            icon: "text-amber-600",
        },
        rose: {
            focus: "focus:border-rose-500 focus:ring-rose-500",
            activeBg: "bg-rose-50 text-rose-800 font-black",
            icon: "text-rose-600",
        },
        purple: {
            focus: "focus:border-purple-600 focus:ring-purple-600",
            activeBg: "bg-purple-50 text-purple-800 font-black",
            icon: "text-purple-600",
        },
        emerald: {
            focus: "focus:border-emerald-600 focus:ring-emerald-600",
            activeBg: "bg-emerald-50 text-emerald-800 font-black",
            icon: "text-emerald-600",
        },
    };

    const activeTheme = themeStyles[theme];

    const normalizedOptions = options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt,
    );

    const selectedOption = normalizedOptions.find((opt) => opt.value === value);

    useEffect(() => {
        const index = normalizedOptions.findIndex((opt) => opt.value === value);
        setSelectedIndex(index);
    }, [value, options]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(target) &&
                listRef.current &&
                !listRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            if (listRef.current && listRef.current.contains(e.target as Node)) {
                return;
            }
            setIsOpen(false);
        };

        if (isOpen) {
            window.addEventListener("scroll", handleScroll, true);
        }
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [isOpen]);

    const toggleDropdown = () => {
        if (disabled) return;
        if (!isOpen && wrapperRef.current) {
            setDropdownRect(wrapperRef.current.getBoundingClientRect());
        }
        setIsOpen(!isOpen);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            !isOpen &&
            (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === " ")
        ) {
            e.preventDefault();
            toggleDropdown();
            return;
        }

        if (isOpen) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < normalizedOptions.length - 1 ? prev + 1 : prev,
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                onChange(normalizedOptions[selectedIndex].value);
                setIsOpen(false);
                if (nextElementId)
                    document.getElementById(nextElementId)?.focus();
            } else if (e.key === "Escape") {
                setIsOpen(false);
            }
        }
    };

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            <div className="relative group">
                <input
                    id={id}
                    type="text"
                    readOnly
                    disabled={disabled}
                    value={selectedOption ? selectedOption.label : ""}
                    placeholder={placeholder}
                    onClick={toggleDropdown}
                    onKeyDown={handleKeyDown}
                    className={`w-full bg-white border-2 border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-bold text-slate-900 cursor-pointer caret-transparent outline-none transition-all focus:ring-1 disabled:opacity-50 disabled:bg-slate-50 ${
                        activeTheme.focus
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

            {isOpen &&
                dropdownRect &&
                createPortal(
                    <ul
                        ref={listRef}
                        className="fixed z-[99999] bg-white border-2 border-slate-300 max-h-52 overflow-y-auto shadow-2xl rounded-xl py-1.5 text-sm hide-scrollbar"
                        style={{
                            top:
                                window.innerHeight - dropdownRect.bottom < 220
                                    ? undefined
                                    : dropdownRect.bottom + 6,
                            bottom:
                                window.innerHeight - dropdownRect.bottom < 220
                                    ? window.innerHeight - dropdownRect.top + 6
                                    : undefined,
                            left: dropdownRect.left,
                            width: dropdownRect.width,
                        }}
                    >
                        {normalizedOptions.map((opt, index) => {
                            const isActive =
                                index === selectedIndex || opt.value === value;

                            return (
                                <li
                                    key={opt.value}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        if (nextElementId)
                                            document
                                                .getElementById(nextElementId)
                                                ?.focus();
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`px-4 py-2.5 hover:cursor-pointer flex items-center justify-between transition-colors uppercase tracking-tight ${
                                        isActive
                                            ? activeTheme.activeBg
                                            : "text-slate-700 font-bold hover:bg-slate-50"
                                    }`}
                                >
                                    <span className="truncate">
                                        {opt.label}
                                    </span>
                                    {isActive && (
                                        <Icon
                                            icon="solar:check-circle-bold"
                                            width="18"
                                            className={activeTheme.icon}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ul>,
                    document.body,
                )}
        </div>
    );
}
