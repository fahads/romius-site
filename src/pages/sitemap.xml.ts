import { content } from '../lib/site';
export async function GET() {
  const data=await content();
  const paths=['/','/about','/clinic-locations','/surgery-locations','/providers','/contact','/patient-resources','/uropharm',...data.providers.map(r=>`/providers/${r.data.slug}`),...data.conditions.map(r=>`/condition/${r.data.slug}`)];
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(p=>`<url><loc>https://www.romiusinstitute.com${p}</loc></url>`).join('')+'</urlset>', {headers:{'Content-Type':'application/xml'}});
}
