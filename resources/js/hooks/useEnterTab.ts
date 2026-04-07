import { useEffect, RefObject } from 'react';

// 🔥 THE FIX: Added generic <T> to safely accept HTMLFormElement and allow nulls
export function useEnterTab<T extends HTMLElement>(ref: RefObject<T | null>) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const target = e.target as HTMLElement;

                // Let textareas naturally add a new line, and let submit buttons naturally submit
                if (target.tagName === 'TEXTAREA' || target.closest('button[type="submit"]')) {
                    return;
                }

                // Allow CustomSelect dropdowns to capture Enter for selection
                if (target.closest('[role="listbox"]') || target.closest('[role="option"]')) {
                    return;
                }

                e.preventDefault();
                if (ref.current) {
                    const focusableElements = ref.current.querySelectorAll(
                        'input:not([disabled]), button:not([disabled]), [tabindex="0"]'
                    );
                    const elements = Array.from(focusableElements) as HTMLElement[];
                    const index = elements.indexOf(target);

                    if (index > -1 && index < elements.length - 1) {
                        elements[index + 1].focus();
                    } else if (index === elements.length - 1) {
                        // If it's the last element, find and trigger the submit button
                        const submitBtn = ref.current.querySelector('button[type="submit"]') as HTMLElement;
                        if (submitBtn) submitBtn.focus();
                    }
                }
            }
        };

        const el = ref.current;
        if (el) {
            el.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            if (el) {
                el.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [ref]);
}