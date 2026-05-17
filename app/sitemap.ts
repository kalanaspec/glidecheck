import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://glidecheck.vercel.app';

    const { data: mice } = await supabase.from('mice').select('name');
    const { data: pads } = await supabase.from('pads').select('name');

    // 💡 වෙනස කලේ මෙතනයි: Array එක කෙලින්ම MetadataRoute.Sitemap ටයිප් එකෙන් Define කරා
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];

    if (mice && pads) {
        mice.forEach((mouse) => {
            pads.forEach((pad) => {
                const mouseSlug = mouse.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const padSlug = pad.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                routes.push({
                    url: `${baseUrl}/${mouseSlug}-with-${padSlug}`,
                    lastModified: new Date(),
                    // දැන් මෙතන කිසිම Type error එකක් එන්නේ නැහැ මචං
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            });
        });
    }

    return routes;
}