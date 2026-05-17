import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. සයිට් එකේ ප්‍රධාන ඩොමේන් URL එක (Vercel URL එක මෙතනට දාන්න)
    const baseUrl = 'https://glidecheck.vercel.app';

    // 2. Supabase එකෙන් දැනට තියෙන හැම Mice සහ Pads ප්‍රමාණයක්ම එකපාර ගන්නවා
    const { data: mice } = await supabase.from('mice').select('name');
    const { data: pads } = await supabase.from('pads').select('name');

    // Base Routes (Home page එක)
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
    ];

    // 3. මූසික සහ පැඩ් ලැයිස්තුව තියෙනවා නම්, හැම එකකටම ගැලපෙන Dynamic URL එක බැගින් ලැයිස්තුවක් හදනවා
    if (mice && pads) {
        mice.forEach((mouse) => {
            pads.forEach((pad) => {
                // අපේ හෝම් පේජ් එකේ තියෙන විදිහටම Slugify (ලස්සන URL එකක්) කරගන්නවා
                const mouseSlug = mouse.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const padSlug = pad.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                routes.push({
                    url: `${baseUrl}/${mouseSlug}-with-${padSlug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.8,
                });
            });
        });
    }

    return routes;
}