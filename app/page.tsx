'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// TypeScript Interfaces for Type Safety
interface Mouse {
    id: string;
    name: string;
    sensor: string;
    default_lod: string;
}

interface Pad {
    id: string;
    name: string;
    material: string;
}

interface CompatibilityResult {
    status: 'Stable' | 'Warning' | 'Unstable';
    recommended_skates: string;
    community_notes: string;
}

export default function Home() {
    const router = useRouter();


    const [mice, setMice] = useState<Mouse[]>([]);
    const [pads, setPads] = useState<Pad[]>([]);

    const [selectedMouse, setSelectedMouse] = useState<string>('');
    const [selectedPad, setSelectedPad] = useState<string>('');

    const [result, setResult] = useState<CompatibilityResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // 1. Fetch Mice and Pads from Supabase when the component loads
    // 1. Fetch Mice and Pads from Supabase when the component loads
    // 1. Fetch Mice and Pads from Supabase when the component loads
    useEffect(() => {
        async function fetchData() {
            console.log("--- FETCH START ---");

            const mouseResponse = await supabase.from('mice').select('*');
            console.log("RAW Mouse Response from Supabase:", mouseResponse);

            const padResponse = await supabase.from('pads').select('*');
            console.log("RAW Pad Response from Supabase:", padResponse);

            if (mouseResponse.data) setMice(mouseResponse.data);
            if (padResponse.data) setPads(padResponse.data);
        }
        fetchData();
    }, []);

    // 2. Query the compatibility table
    const checkCompatibility = () => {
        if (!selectedMouse || !selectedPad) return;

        // 1. Dropdown එකෙන් සිලෙක්ට් කරපු ID එකට අදාළ Object එක හොයාගන්නවා
        const mouseObj = mice.find(m => m.id === selectedMouse);
        const padObj = pads.find(p => p.id === selectedPad);

        if (mouseObj && padObj) {
            // 2. නම් ටික URL එකට ගැලපෙන විදිහට Clean කරගන්නවා (Slugify): "VXE MAD R+" -> "vxe-mad-r"
            const mouseSlug = mouseObj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const padSlug = padObj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // 3. ලස්සන SEO URL එකකට පුෂ් කරනවා!
            router.push(`/${mouseSlug}-with-${padSlug}`);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 text-center mb-2">
                    🎮 GlideCheck.gg
                </h1>
                <p className="text-slate-400 text-center mb-8 text-sm">
                    Check if your Gaming Mouse sensor spins out on Glass Mouse Pads.
                </p>

                <div className="space-y-6">
                    {/* Mouse Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Select Gaming Mouse</label>
                        <select
                            value={selectedMouse}
                            onChange={(e) => setSelectedMouse(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">-- Choose a Mouse --</option>
                            {mice.map((mouse) => (
                                <option key={mouse.id} value={mouse.id}>
                                    {mouse.name} ({mouse.sensor})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Pad Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Select Glass Mouse Pad</label>
                        <select
                            value={selectedPad}
                            onChange={(e) => setSelectedPad(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                            <option value="">-- Choose a Pad --</option>
                            {pads.map((pad) => (
                                <option key={pad.id} value={pad.id}>
                                    {pad.name} ({pad.material})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={checkCompatibility}
                        disabled={!selectedMouse || !selectedPad || loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:text-slate-500 shadow-lg shadow-cyan-500/10"
                    >
                        {loading ? 'Analyzing Data...' : 'Check Compatibility'}
                    </button>
                </div>

                {/* Result Display */}
                {result && (
                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Analysis Result:</h3>

                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm">Status:</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    result.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        result.status === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                  {result.status}
                </span>
                            </div>

                            <div>
                                <p className="text-slate-400 text-xs">Recommended Skates:</p>
                                <p className="text-sm text-cyan-400 font-medium">{result.recommended_skates}</p>
                            </div>

                            <div>
                                <p className="text-slate-400 text-xs">Community Notes:</p>
                                <p className="text-sm text-slate-300 mt-0.5 italic leading-relaxed">
                                    "{result.community_notes}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}