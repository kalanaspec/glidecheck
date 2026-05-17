import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ mouse_and_pad: string }>;
}

// 🌐 1. මේකෙන් තමයි Google එකට සයිට් එකේ Title එකයි Description එකයි dynamic විදිහට පෙන්වන්නේ (SEO Metadata)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { mouse_and_pad } = await params;
    const parts = mouse_and_pad.split('-with-');
    const mouseName = parts[0]?.replace(/-/g, ' ');
    const padName = parts[1]?.replace(/-/g, ' ');

    return {
        title: `${mouseName?.toUpperCase()} + ${padName?.toUpperCase()} Glass Pad Compatibility & LOD Settings`,
        description: `Check if the ${mouseName} spins out or tracks well on the ${padName} glass mouse pad. View community diagnostics and recommended skates.`
    };
}

export default async function CompatibilityPage({ params }: PageProps) {
    const { mouse_and_pad } = await params;

    // 2. URL එකෙන් එන ස්ලග් එක කඩනවා (e.g., "vxe-mad-r-with-skypad-3-0-xl")
    const parts = mouse_and_pad.split('-with-');
    const mouseSlug = parts[0]?.replace(/-/g, ' ');
    const padSlug = parts[1]?.replace(/-/g, ' ');

    // 3. Supabase එකෙන් නම බෝල්ඩ් කරලා (ILIKE) සර්ච් කරලා Row එක ගන්නවා
    const { data: mouseData } = await supabase
        .from('mice')
        .select('*')
        .ilike('name', `%${mouseSlug}%`)
        .single();

    const { data: padData } = await supabase
        .from('pads')
        .select('*')
        .ilike('name', `%${padSlug}%`)
        .single();

    let compatibilityResult = null;

    if (mouseData && padData) {
        const { data } = await supabase
            .from('compatibility')
            .select('*')
            .eq('mouse_id', mouseData.id)
            .eq('pad_id', padData.id)
            .single();

        compatibilityResult = data;
    }

    if (!mouseData || !padData) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
                <div className="text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md">
                    <h1 className="text-2xl font-bold text-rose-400 mb-4">Combo Not Found</h1>
                    <p className="text-slate-400 mb-6">We haven't indexed this specific mouse and pad combination yet.</p>
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

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">Glide Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            compatibilityResult?.status === 'Stable' || !compatibilityResult ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                compatibilityResult.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
                            "{compatibilityResult?.community_notes || 'No tracking anomalies or spin-outs reported by the community for this setup.'}"
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}