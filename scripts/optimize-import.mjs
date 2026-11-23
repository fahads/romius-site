// One-time import optimization. Source uploads remain unchanged.
import sharp from 'sharp';
import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const dir=new URL('src/assets/cms/',root);
const map={};
for(const name of await fs.readdir(dir)) {
 if(!/\.(jpe?g|png)$/i.test(name))continue;
 const next=name.replace(/\.[^.]+$/,'.webp');
 await sharp(new URL(name,dir).pathname).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toFile(new URL(next,dir).pathname);
 map[name]=next;
 await fs.unlink(new URL(name,dir));
}
for(const col of ['clinics','providers','conditions','surgeryLocations']) {
 const d=new URL(`src/content/${col}/`,root);
 for(const name of await fs.readdir(d)) {
  const file=new URL(name,d);let data=JSON.parse(await fs.readFile(file,'utf8'));
  for(const field of ['image','thumbnail'])if(map[data[field]])data[field]=map[data[field]];
  await fs.writeFile(file,JSON.stringify(data,null,2)+'\n');
 }
}
console.log(`Optimized ${Object.keys(map).length} CMS assets`);
