export function GET() {
  const allow=import.meta.env.PUBLIC_ALLOW_INDEXING==='true';
  return new Response(allow?'User-agent: *\nAllow: /\nSitemap: https://www.romiusinstitute.com/sitemap.xml\n':'User-agent: *\nDisallow: /\n', {headers:{'Content-Type':'text/plain'}});
}
