//resources\js\hooks\useEnterTab.ts
import { useEffect, RefObject } from "react";

export function useEnterTab<T extends HTMLElement>(ref: RefObject<T | null>) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                const target = e.target as HTMLElement;

                if (
                    target.tagName === "TEXTAREA" ||
                    target.closest('button[type="submit"]')
                ) {
                    return;
                }

                if (
                    target.closest('[role="listbox"]') ||
                    target.closest('[role="option"]')
                ) {
                    return;
                }

                e.preventDefault();
                if (ref.current) {
                    const focusableElements = ref.current.querySelectorAll(
                        'input:not([disabled]), button:not([disabled]), [tabindex="0"]',
                    );
                    const elements = Array.from(
                        focusableElements,
                    ) as HTMLElement[];
                    const index = elements.indexOf(target);

                    if (index > -1 && index < elements.length - 1) {
                        elements[index + 1].focus();
                    } else if (index === elements.length - 1) {
                        const submitBtn = ref.current.querySelector(
                            'button[type="submit"]',
                        ) as HTMLElement;
                        if (submitBtn) submitBtn.focus();
                    }
                }
            }
        };

        const el = ref.current;
        if (el) {
            el.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            if (el) {
                el.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, [ref]);
}
