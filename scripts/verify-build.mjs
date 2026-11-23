import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
const root=path.resolve('dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root),pages=files.filter(f=>f.endsWith('.html'));
const problems=[];
function local(value,source) {
 if(!value || value.startsWith('#') || /^(?:data:|mailto:|tel:)/i.test(value))return;
 if(/^https?:|^\/\//.test(value))return;
 const u=new URL(value,'https://local.test/'+path.relative(root,source));
 const target=path.join(root,decodeURIComponent(u.pathname));
 if(!fs.existsSync(target) && !fs.existsSync(path.join(target,'index.html')))problems.push(`${path.relative(root,source)} -> ${value}`);
}
for(const file of pages) {
 const $=load(fs.readFileSync(file,'utf8'));
 assert($('title').text().trim(),`Missing title: ${file}`);
 assert.equal($('main').length,1,`Expected one main landmark: ${file}`);
 assert.equal($('form').length,0,`Unexpected form: ${file}`);
 assert.equal($('.w-dyn-empty,.w-dyn-bind-empty').length,0,`Unpopulated CMS: ${file}`);
 $('[href],[src]').each((_,el)=>{local($(el).attr('href'),file);local($(el).attr('src'),file);});
 $('[srcset]').each((_,el)=>{for(const v of $(el).attr('srcset').split(','))local(v.trim().split(/\s+/)[0],file);});
 $('script[src],link[rel="stylesheet"],img[src]').each((_,el)=>{
  const v=$(el).attr('src')||$(el).attr('href');
  if(/^https?:|^\/\//.test(v))problems.push(`Remote runtime asset: ${v}`);
 });
}
for(const file of files.filter(f=>f.endsWith('.css'))) {
 for(const [,v] of fs.readFileSync(file,'utf8').matchAll(/url\(["']?([^\s)'";]+)["']?\)/g))local(v,file);
}
const counts={};
for(const collection of ['clinics','surgeryLocations','providers','conditions']) {
 const entries=fs.readdirSync(`src/content/${collection}`).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(`src/content/${collection}/${f}`,'utf8')));
 counts[collection]=entries.filter(d=>!d.draft&&!d.archived).length;
 assert.equal(new Set(entries.map(d=>d.slug)).size,entries.length,`Duplicate slug in ${collection}`);
 if(['providers','conditions'].includes(collection))for(const d of entries.filter(d=>!d.draft&&!d.archived)) {
  const prefix=collection==='conditions'?'condition':'providers';
  assert(fs.existsSync(path.join(root,prefix,d.slug,'index.html')),`Missing detail route: ${d.slug}`);
 }
}
const clinicPage=load(fs.readFileSync(path.join(root,'clinic-locations/index.html'),'utf8'));
assert.equal(clinicPage('.location-grid .w-dyn-item').length,counts.clinics);
const surgeryPage=load(fs.readFileSync(path.join(root,'surgery-locations/index.html'),'utf8'));
assert.equal(surgeryPage('.location-grid .w-dyn-item').length,counts.surgeryLocations);
assert(clinicPage('a[href="tel:4193994080;ext=274"]').length,'Phone extension lost');
assert.deepEqual([...new Set(problems)],[],'Broken links or asset dependencies');
console.log(`Verified ${pages.length} HTML pages: CMS counts, detail routes, local links/assets, no remote runtime assets, no forms, and telephone extension.`);
