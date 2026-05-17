import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ mouse_and_pad: string }>;
}

// 🌐 1. Google SEO Dynamic Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { mouse_and_pad } = await params;
    const parts = mouse_and_pad.split('-with-');
    const mouseName = parts[0]?.replace(/-/g, ' ');
    const padName = parts[1]?.replace(/-/g, ' ');

    return {
        title: `${mouseName?.toUpperCase()} + ${padName?.toUpperCase()} Glass Pad Compatibility`,
        description: `Check if the ${mouseName} tracks well on the ${padName} glass mouse pad. View recommended skates.`
    };
}

export default async function CompatibilityPage({ params }: PageProps) {
    const { mouse_and_pad } = await params;

    // 2. URL එකෙන් එන ස්ලග් එක කඩනවා
    const parts = mouse_and_pad.split('-with-');
    const mouseSlug = parts[0] || ''; // e.g. "vxe-mad-r"
    const padSlug = parts[1] || '';   // e.g. "skypad-3-0-xl"

    // 🔍 SMART FALLBACK: "+" ලකුණු හෝ වෙනත් දේවල් නිසා සර්ච් එක මිස් නොවෙන්න පළමු වචන 2ක් පමණක් අරන් සර්ච් කරනවා
    // "vxe-mad-r" -> ["vxe", "mad", "r"] -> "vxe mad"
    const mouseSearchTerm = mouseSlug.split('-').slice(0, 2).join(' ');
    const padSearchTerm = padSlug.split('-').slice(0, 2).join(' ');

    // 3. Supabase එකෙන් Fuzzy Match එකක් දාලා Row එක කියවනවා
    const { data: mouseData } = await supabase
        .from('mice')
        .select('*')
        .ilike('name', `%${mouseSearchTerm}%`)
        .limit(1)
        .maybeSingle();

    const { data: padData } = await supabase
        .from('pads')
        .select('*')
        .ilike('name', `%${padSearchTerm}%`)
        .limit(1)
        .maybeSingle();

    let compatibilityResult = null;

    // 4. දත්ත හමු වුණොත් විතරක් Compatibility Table එක query කරනවා
    if (mouseData && padData) {
        const { data } = await supabase
            .from('compatibility')
            .select('*')
            .eq('mouse_id', mouseData.id)
            .eq('pad_id', padData.id)
            .limit(1)
            .maybeSingle();

        compatibilityResult = data;
    }

    // 5. මූසිකය හෝ පැඩ් එක ඩේටාබේස් එකේ ඇත්තෙම නැත්නම් විතරක් "Hardware Not Found" පෙන්වනවා
    if (!mouseData || !padData) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
                <div className="text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-2xl">
                    <h1 className="text-2xl font-bold text-rose-400 mb-4">Hardware Not Found</h1>
                    <p className="text-slate-400 mb-6 text-sm">We haven't indexed this specific hardware model in our database yet.</p>
                    <Link href="/" className="text-cyan-400 hover:underline text-sm font-medium">
                        ← Go Back Home
                    </Link>
                </div>
            </main>
        );
    }

    // 6. ඩේටාබේස් එකේ විශේෂයෙන්ම සටහන් කරපු Compatibility එකක් නැත්නම් -> Default "Stable" Fallback එක දෙනවා (Great UX!)
    const finalStatus = compatibilityResult?.status || 'Stable';
    const finalSkates = compatibilityResult?.recommended_skates || 'Stock PTFE or Aftermarket Ice Skates';
    const finalNotes = compatibilityResult?.community_notes || 'No tracking anomalies or spin-outs reported by the community. Excellent 1:1 sensor tracking on this glass surface.';

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

                <Link href="/" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mb-6 font-medium">
                    ← Back to Checker
                </Link>

                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-6">
                    {mouseData.name} + {padData.name} Compatibility
                </h1>

                {/* Technical Specs Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mouse Specs</h3>
                        <p className="text-base font-bold text-slate-200 mt-1">{mouseData.name}</p>
                        <p className="text-xs text-slate-400 mt-1">Sensor: <span className="text-slate-300 font-medium">{mouseData.sensor}</span></p>
                        <p className="text-xs text-slate-400">Default LOD: <span className="text-slate-300 font-medium">{mouseData.default_lod}</span></p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mouse Pad Specs</h3>
                        <p className="text-base font-bold text-slate-200 mt-1">{padData.name}</p>
                        <p className="text-xs text-slate-400 mt-1">Material: <span className="text-slate-300 font-medium">{padData.material || 'Glass'}</span></p>
                    </div>
                </div>

                {/* Diagnostics & Status Panel */}
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">Glide Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            finalStatus === 'Stable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                finalStatus === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
              {finalStatus}
            </span>
                    </div>

                    <div>
                        <p className="text-slate-400 text-xs font-medium">Recommended Skates Configuration:</p>
                        <p className="text-sm text-cyan-400 font-bold mt-0.5">
                            {finalSkates}
                        </p>
                    </div>

                    <div>
                        <p className="text-slate-400 text-xs font-medium">Community Diagnostics:</p>
                        <p className="text-sm text-slate-300 mt-1.5 italic leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-900">
                            "{finalNotes}"
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}