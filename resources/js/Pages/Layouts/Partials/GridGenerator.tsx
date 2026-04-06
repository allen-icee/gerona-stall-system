import { Icon } from '@iconify/react';

export default function GridGenerator({ genData, setGenData, onSubmit, processing }: any) {
    return (
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border-2 border-slate-200">
            <div className="text-center mb-6">
                <Icon icon="solar:magic-stick-3-bold-duotone" className="w-16 h-16 mx-auto mb-2 text-amber-500" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Generate Map Grid</h2>
                <p className="text-sm text-slate-500 font-bold">Set the dimensions for this floor's physical layout.</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Rows (Height)</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={genData.total_rows}
                            // THE FIX: Check for empty string before parsing!
                            onChange={e => setGenData('total_rows', e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="w-full border-2 border-slate-300 rounded-lg font-bold text-center focus:border-amber-500 focus:ring-0 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1 block">Columns (Width)</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={genData.total_cols}
                            // THE FIX: Check for empty string before parsing!
                            onChange={e => setGenData('total_cols', e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="w-full border-2 border-slate-300 rounded-lg font-bold text-center focus:border-amber-500 focus:ring-0 outline-none"
                            required
                        />
                    </div>
                </div>
                <button type="submit" disabled={processing} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black uppercase py-3 rounded-lg mt-4 shadow-sm border-b-4 border-amber-700 transition-colors">
                    Create Blank Grid
                </button>
            </form>
        </div>
    );
}