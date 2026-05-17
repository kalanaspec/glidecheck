import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{ mouse?: string; pad?: string }>;
}

export default async function CompatibilityPage({ searchParams }: PageProps) {
    // 1. Await searchParams as required in Next.js 15+
    const params = await searchParams;
    const mouseId = params.mouse;
    const padId = params.pad;

    if (!mouseId || !padId) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
                <div className="text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md">
                    <h1 className="text-2xl font-bold text-rose-400 mb-4">Invalid Request</h1>
                    <p className="text-slate-400 mb-6">Please select both a gaming mouse and a mouse pad first.</p>
                    <Link href="/" className="text-cyan-400 hover:underline">← Go Back Home</Link>
                </div>
            </main>
        );
    }

    // 2. Fetch Mouse and Pad details using their strict UUIDs
    const { data: mouseData } = await supabase
        .from('mice')
        .select('*')
        .eq('id', mouseId)
        .single();

    const { data: padData } = await supabase
        .from('pads')
        .select('*')
        .eq('id', padId)
        .single();

    // 3. Fetch specific Compatibility row matching both foreign keys
    const { data: compatibilityResult } = await supabase
        .from('compatibility')
        .select('*')
        .eq('mouse_id', mouseId)
        .eq('pad_id', padId)
        .single();

    // Fallback state if the database entries don't exist
    if (!mouseData || !padData) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
                <div className="text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md">
                    <h1 className="text-2xl font-bold text-rose-400 mb-4">Hardware Not Found</h1>
                    <p className="text-slate-400 mb-6">The selected hardware components could not be found in our database.</p>
                    <Link href="/" className="text-cyan-400 hover:underline">← Go Back Home</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

                <Link href="/" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mb-6">
                    ← Back to Checker
                </Link>

                {/* Dynamic Title loaded with exact names */}
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-6">
                    {mouseData.name} + {padData.name} Compatibility
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mouse Specs</h3>
                        <p className="text-base font-bold text-slate-200 mt-1">{mouseData.name}</p>
                        <p className="text-sm text-slate-400 mt-0.5">Sensor: {mouseData.sensor}</p>
                        <p className="text-sm text-slate-400">Default LOD: {mouseData.default_lod}</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mouse Pad Specs</h3>
                        <p className="text-base font-bold text-slate-200 mt-1">{padData.name}</p>
                        <p className="text-sm text-slate-400 mt-0.5">Material: {padData.material}</p>
                    </div>
                </div>

                {/* Live Compatibility Diagnostics from Supabase */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">Glide Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            compatibilityResult?.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                compatibilityResult?.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    compatibilityResult?.status === 'Unstable' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' // Default fallback
                        }`}>
              {compatibilityResult?.status || 'Stable'}
            </span>
                    </div>

                    <div>
                        <p className="text-slate-400 text-xs font-medium">Recommended Skates Configuration:</p>
                        <p className="text-sm text-cyan-400 font-bold mt-0.5">
                            {compatibilityResult?.recommended_skates || 'Stock PTFE Skates'}
                        </p>
                    </div>

                    <div>
                        <p className="text-slate-400 text-xs font-medium">Community Diagnostics:</p>
                        <p className="text-sm text-slate-300 mt-1 italic leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-900">
                            "{compatibilityResult?.community_notes || 'No specific tracking anomalies or spin-outs reported yet for this combination.'}"
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}