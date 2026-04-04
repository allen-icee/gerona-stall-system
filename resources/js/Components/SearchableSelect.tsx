import { useState, useEffect, useRef, KeyboardEvent } from "react";
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
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    theme?: "blue" | "amber" | "rose" | "purple";
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export default function SearchableSelect({
    id,
    nextElementId,
    value,
    onChange,
    options,
    placeholder = "Search and select...",
    disabled = false,
    error,
    theme = "blue",
    onKeyDown,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const themeStyles = {
        blue: {
            focus: "focus:border-blue-600 focus:ring-blue-600",
            activeBg: "bg-blue-50 text-blue-700 font-black",
            highlightBg: "bg-blue-100/50",
        },
        amber: {
            focus: "focus:border-amber-500 focus:ring-amber-500",
            activeBg: "bg-amber-50 text-amber-700 font-black",
            highlightBg: "bg-amber-100/50",
        },
        rose: {
            focus: "focus:border-rose-500 focus:ring-rose-500",
            activeBg: "bg-rose-50 text-rose-700 font-black",
            highlightBg: "bg-rose-100/50",
        },
        purple: {
            focus: "focus:border-purple-600 focus:ring-purple-600",
            activeBg: "bg-purple-50 text-purple-700 font-black",
            highlightBg: "bg-purple-100/50",
        },
    };

    const activeTheme = themeStyles[theme];

    const normalizedOptions = options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt,
    );

    const selectedOption = normalizedOptions.find((opt) => opt.value === value);

    // Sync input text with the selected option label when closed
    useEffect(() => {
        setSearchTerm(selectedOption ? selectedOption.label : "");
    }, [value, options]);

    const filteredOptions = normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Close on click outside (checking both wrapper and portal)
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
                setSearchTerm(selectedOption ? selectedOption.label : ""); // Revert search term
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedOption]);

    // Close on scroll to prevent portal detachment
    // Close on scroll to prevent detachment, but IGNORE internal dropdown scrolling
    useEffect(() => {
        const handleScroll = (e: Event) => {
            // If the scroll event originated from INSIDE our dropdown list, do nothing!
            if (listRef.current && listRef.current.contains(e.target as Node)) {
                return;
            }
            // Otherwise, they are scrolling the background, so close it.
            setIsOpen(false);
        };

        if (isOpen) {
            window.addEventListener("scroll", handleScroll, true);
        }
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [isOpen]);

    const openDropdown = () => {
        if (disabled) return;
        if (wrapperRef.current) {
            setDropdownRect(wrapperRef.current.getBoundingClientRect());
        }
        setIsOpen(true);
        setSearchTerm(""); // Clear text to allow searching all options!
    };

    const handleSelect = (opt: SelectOption) => {
        onChange(opt.value);
        setSearchTerm(opt.label);
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
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev,
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case "Enter":
                e.preventDefault();
                if (
                    highlightedIndex >= 0 &&
                    highlightedIndex < filteredOptions.length
                ) {
                    handleSelect(filteredOptions[highlightedIndex]);
                    if (nextElementId)
                        document.getElementById(nextElementId)?.focus();
                } else if (filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0]);
                    if (nextElementId)
                        document.getElementById(nextElementId)?.focus();
                }
                break;
            case "Escape":
                setIsOpen(false);
                setSearchTerm(selectedOption ? selectedOption.label : "");
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
                        if (!isOpen) {
                            if (wrapperRef.current)
                                setDropdownRect(
                                    wrapperRef.current.getBoundingClientRect(),
                                );
                            setIsOpen(true);
                        }
                    }}
                    onFocus={openDropdown}
                    onKeyDown={handleInternalKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`w-full bg-white border-2 border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-bold text-slate-900 transition-all outline-none focus:ring-1 hover:cursor-pointer ${
                        activeTheme.focus
                    } ${error ? "border-rose-600 focus:border-rose-600 focus:ring-rose-600" : ""}
                    disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed`}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        width="20"
                    />
                </div>
            </div>

            {isOpen &&
                !disabled &&
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
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, index) => (
                                <li
                                    key={opt.value}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelect(opt);
                                        if (nextElementId)
                                            document
                                                .getElementById(nextElementId)
                                                ?.focus();
                                    }}
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                    className={`px-4 py-2.5 hover:cursor-pointer flex items-center justify-between transition-colors ${
                                        value === opt.value
                                            ? activeTheme.activeBg
                                            : index === highlightedIndex
                                              ? `${activeTheme.highlightBg} text-slate-900 font-bold`
                                              : "text-slate-700 font-bold hover:bg-slate-50"
                                    }`}
                                >
                                    <span className="truncate uppercase tracking-tight">
                                        {opt.label}
                                    </span>
                                    {value === opt.value && (
                                        <Icon
                                            icon="solar:check-circle-bold"
                                            width="18"
                                            className="text-blue-600"
                                        />
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-6 text-slate-400 text-center flex flex-col items-center gap-2">
                                <Icon
                                    icon="solar:minimalistic-magnifer-zoom-out-bold"
                                    width="28"
                                    className="opacity-20"
                                />
                                <span className="font-bold text-xs uppercase">
                                    No matches found
                                </span>
                            </li>
                        )}
                    </ul>,
                    document.body,
                )}
        </div>
    );
}
