//resources/js/Components/SearchableSelect.tsx
import { useState, useEffect, useRef, KeyboardEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

export interface SelectOption {
    value: string | number;
    label: string | ReactNode;
    searchString?: string;
}

interface Props {
    id?: string;
    nextElementId?: string;
    value: string | number | undefined | null;
    onChange: (value: any) => void;
    options: any[]; // 🔥 Changed to any[] to suppress strict typing errors
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    theme?: "blue" | "amber" | "rose" | "purple" | "emerald";
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
    const inputRef = useRef<HTMLInputElement>(null);

    const themeStyles = {
        blue: {
            focusWithin:
                "focus-within:border-blue-600 focus-within:ring-blue-600",
            activeBg: "bg-blue-50 text-blue-700 font-black",
            highlightBg: "bg-blue-100/50",
        },
        amber: {
            focusWithin:
                "focus-within:border-amber-500 focus-within:ring-amber-500",
            activeBg: "bg-amber-50 text-amber-700 font-black",
            highlightBg: "bg-amber-100/50",
        },
        rose: {
            focusWithin:
                "focus-within:border-rose-500 focus-within:ring-rose-500",
            activeBg: "bg-rose-50 text-rose-700 font-black",
            highlightBg: "bg-rose-100/50",
        },
        purple: {
            focusWithin:
                "focus-within:border-purple-600 focus-within:ring-purple-600",
            activeBg: "bg-purple-50 text-purple-700 font-black",
            highlightBg: "bg-purple-100/50",
        },
        emerald: {
            focusWithin:
                "focus-within:border-emerald-600 focus-within:ring-emerald-600",
            activeBg: "bg-emerald-50 text-emerald-700 font-black",
            highlightBg: "bg-emerald-100/50",
        },
    };

    const activeTheme = themeStyles[theme];

    const normalizedOptions = options.map((opt) =>
        typeof opt === "string"
            ? { value: opt, label: opt, searchString: opt }
            : opt,
    );

    const selectedOption = normalizedOptions.find((opt) => opt.value === value);

    const getDisplayText = (opt: SelectOption | undefined) => {
        if (!opt) return "";
        if (opt.searchString) return opt.searchString;
        if (typeof opt.label === "string") return opt.label;
        return String(opt.value);
    };

    useEffect(() => {
        setSearchTerm(getDisplayText(selectedOption));
    }, [value, options]);

    const filteredOptions = normalizedOptions.filter((opt) => {
        const textToSearch =
            opt.searchString ||
            (typeof opt.label === "string" ? opt.label : String(opt.value));
        return textToSearch.toLowerCase().includes(searchTerm.toLowerCase());
    });

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
                setSearchTerm(getDisplayText(selectedOption));
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedOption]);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            if (listRef.current && listRef.current.contains(e.target as Node))
                return;
            setIsOpen(false);
        };
        if (isOpen) window.addEventListener("scroll", handleScroll, true);
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [isOpen]);

    const openDropdown = () => {
        if (disabled) return;
        if (wrapperRef.current)
            setDropdownRect(wrapperRef.current.getBoundingClientRect());
        setIsOpen(true);
        setSearchTerm("");
    };

    const handleSelect = (opt: SelectOption) => {
        onChange(opt.value);
        setSearchTerm(getDisplayText(opt));
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
                setSearchTerm(getDisplayText(selectedOption));
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div
                className={`relative bg-white rounded-lg border-2 border-slate-300 focus-within:ring-1 overflow-hidden transition-all ${activeTheme.focusWithin} ${error ? "!border-rose-600 !ring-rose-600" : ""} ${disabled ? "opacity-50 bg-slate-50" : ""}`}
            >
                <input
                    id={id}
                    ref={inputRef}
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
                    onClick={() => {
                        if (!isOpen) openDropdown();
                    }}
                    onKeyDown={handleInternalKeyDown}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={`w-full bg-transparent border-none pl-4 pr-10 py-2 min-h-[46px] text-sm font-bold text-slate-900 outline-none focus:ring-0 ${disabled ? "cursor-not-allowed" : "cursor-text"}`}
                />

                {!isOpen &&
                    selectedOption &&
                    typeof selectedOption.label !== "string" && (
                        <div
                            className="absolute inset-0 z-10 flex flex-col justify-center pl-4 pr-10 cursor-pointer bg-white"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!disabled) {
                                    openDropdown();
                                    setTimeout(
                                        () => inputRef.current?.focus(),
                                        10,
                                    );
                                }
                            }}
                        >
                            {selectedOption.label}
                        </div>
                    )}

                <div
                    className={`absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer transition-colors z-20 ${disabled ? "text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (disabled) return;
                        if (isOpen) {
                            setIsOpen(false);
                            setSearchTerm(getDisplayText(selectedOption));
                        } else {
                            openDropdown();
                            setTimeout(() => inputRef.current?.focus(), 10);
                        }
                    }}
                >
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
                        className="fixed z-[99999] bg-white border-2 border-slate-300 max-h-60 overflow-y-auto shadow-2xl rounded-xl py-1.5 text-sm hide-scrollbar"
                        style={{
                            top:
                                window.innerHeight - dropdownRect.bottom < 240
                                    ? undefined
                                    : dropdownRect.bottom + 6,
                            bottom:
                                window.innerHeight - dropdownRect.bottom < 240
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
                                    className={`px-4 py-2 hover:cursor-pointer flex items-center justify-between transition-colors ${
                                        value === opt.value
                                            ? activeTheme.activeBg
                                            : index === highlightedIndex
                                              ? `${activeTheme.highlightBg} text-slate-900 font-bold`
                                              : "text-slate-700 font-bold hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="flex-1 w-full overflow-hidden">
                                        {typeof opt.label === "string" ? (
                                            <span className="truncate uppercase tracking-tight block w-full">
                                                {opt.label}
                                            </span>
                                        ) : (
                                            opt.label
                                        )}
                                    </div>
                                    {value === opt.value && (
                                        <Icon
                                            icon="solar:check-circle-bold"
                                            width="18"
                                            className="text-blue-600 ml-3 shrink-0"
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
