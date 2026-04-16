// resources/js/Components/Pagination.tsx
import { Link } from "@inertiajs/react";

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-center mt-6 mb-2 space-x-1">
            {links.map((link, index) => {
                return link.url === null ? (
                    <div
                        key={index}
                        className="px-4 py-2 text-sm text-gray-400 bg-white border border-gray-200 rounded cursor-not-allowed"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <Link
                        key={index}
                        href={link.url}
                        preserveState // <-- Add this!
                        preserveScroll // <-- Add this!
                        className={`px-4 py-2 text-sm border rounded hover:bg-gray-100 focus:border-indigo-500 focus:text-indigo-500 transition-colors duration-150 ${
                            link.active
                                ? "bg-indigo-50 border-indigo-500 text-indigo-600 font-bold"
                                : "bg-white border-gray-300 text-gray-700"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}
