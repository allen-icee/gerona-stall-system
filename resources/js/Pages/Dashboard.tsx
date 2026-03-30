import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Control Panel Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Welcome Card */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border-l-4 border-blue-600">
                        <div className="p-6 text-gray-900 font-medium">
                            You are logged in to the Gerona Stall Management System.
                        </div>
                    </div>

                    {/* Placeholder Grid for the Map we will build */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center h-32">
                            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Total Stalls</span>
                            <span className="text-3xl font-black text-gray-800 mt-2">--</span>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center h-32">
                            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Occupied</span>
                            <span className="text-3xl font-black text-emerald-600 mt-2">--</span>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center h-32">
                            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Vacant</span>
                            <span className="text-3xl font-black text-rose-500 mt-2">--</span>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}