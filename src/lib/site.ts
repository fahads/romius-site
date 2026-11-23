import { getCollection, type CollectionEntry } from 'astro:content';
import { load } from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import metadata from '../templates/metadata.json';

const templates = import.meta.glob('../templates/**/*.html', {query:'?raw', import:'default', eager:true}) as Record<string,string>;
const images = import.meta.glob('../assets/cms/*', {query:'?url', import:'default', eager:true}) as Record<string,string>;
export function template(path:string) {
  const value = templates[`../templates/${path}.html`];
  if (!value) throw new Error(`Missing template: ${path}`);
  return value;
}
export function asset(name:string) {
  if (!name) return '/images/provider-placeholder.svg';
  if (name.startsWith('/images/')) return name;
  const url = images[`../assets/cms/${name}`];
  if (!url) throw new Error(`Missing CMS asset: ${name}`);
  return url;
}
export const escape = (s:string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const rich = (s:string) => sanitizeHtml(s, {
  allowedTags: sanitizeHtml.defaults.allowedTags,
  allowedAttributes: {a:['href','title','target','rel']},
  allowedSchemes:['http','https','mailto','tel'],
  transformTags:{a:sanitizeHtml.simpleTransform('a',{rel:'noopener noreferrer'})}
});
export const phoneLink = (s:string) => {
  const parts = s.split(/\s*(?:ext\.?|x)\s*/i);
  return 'tel:' + parts[0].replace(/[^\d+]/g,'') + (parts[1] ? ';ext='+parts[1].replace(/\D/g,'') : '');
};
const visible = (entry:{data:{draft:boolean;archived:boolean}}) => !entry.data.draft && !entry.data.archived;
export async function content() {
  const [clinics,surgeryLocations,providers,conditions] = await Promise.all([
    getCollection('clinics',visible), getCollection('surgeryLocations',visible),
    getCollection('providers',visible), getCollection('conditions',visible)
  ]);
  for (const items of [clinics,surgeryLocations,providers]) items.sort((a,b)=>a.data.order-b.data.order || a.data.name.localeCompare(b.data.name));
  conditions.sort((a,b)=>a.data.name.localeCompare(b.data.name));
  return {clinics,surgeryLocations,providers,conditions};
}
type Data = Awaited<ReturnType<typeof content>>;
type Place = CollectionEntry<'clinics'>['data'] | CollectionEntry<'surgeryLocations'>['data'];
function locationCard(d:Place,kind:string,region:number) {
  const $=load(template(`cards/${kind}-${region}`),null,false);
  $('h3').text(d.city || d.name);
  $('.text-meta').first().text(d.name);
  $('.contact-office-image-content').attr('href',d.website || d.mapUrl || '/contact').attr('aria-label',d.name);
  $('img').attr('src',asset(d.image)).attr('alt',d.name).removeAttr('srcset');
  const groups=$('.job-details-list .button-group');
  const address=groups.eq(0).find('a');address.attr('href',d.mapUrl || d.website || '/contact').text(d.address);
  const phone=groups.eq(1).find('a, .text-block-3, .text-block-4, .link-5').last();
  if(phone.length) phone.replaceWith(`<a class="text-block-3" href="${escape(phoneLink(d.phone))}">${escape(d.phone)}</a>`);
  else groups.eq(1).append(`<a href="${escape(phoneLink(d.phone))}">${escape(d.phone)}</a>`);
  $('[class]').each((_,el)=>{$(el).removeClass('w-dyn-bind-empty');});
  return $.html();
}
function contactCard(d:Place) {
  const $=load(template('cards/contact-0'),null,false);
  $('h3').text(d.city || d.name);
  $('.contact-office-image-content').attr('href',d.mapUrl || '/clinic-locations').attr('aria-label',d.name);
  $('img').attr('src',asset(d.image)).attr('alt',d.name);
  $('.contact-office-content > .margin-bottom a').attr('href',d.mapUrl || '/clinic-locations').text(`${d.name} — ${d.address}`);
  $('.button-text').attr('href',phoneLink(d.phone));$('.button-text-text').text(d.phone);
  $('[class]').each((_,el)=>{$(el).removeClass('w-dyn-bind-empty');});
  return $.html();
}
function providerCard(d:CollectionEntry<'providers'>['data']) {
  const $=load(template('cards/providers-0'),null,false);
  $('a').attr('href',`/providers/${d.slug}`);$('h2').text(d.name);$('.text-meta').text(d.type);
  $('img').attr('src',asset(d.thumbnail || d.image)).attr('alt',d.name);
  $('[class]').each((_,el)=>{$(el).removeClass('w-dyn-bind-empty');});
  return $.html();
}
function conditionList(entries:Data['conditions'],home=false) {
  return entries.map(({data:d})=> home
    ? `<div class="collection-item w-dyn-item" role="listitem"><a class="expertise-list-item w-inline-block" href="/condition/${d.slug}"><div class="expertise-list-item-inner"><div class="expertise-list-item-line"></div><h3 class="heading-style-h4">${escape(d.name)}</h3></div><div class="expertise-list-item-icon-wrapper"><div class="expertise-list-item-icon">&#8594;</div></div></a></div>`
    : `<div class="w-dyn-item" role="listitem"><a class="nav-item w-inline-block" href="/condition/${d.slug}"><div class="nav-item-line"></div><div class="nav-item-text">${escape(d.name)}</div></a></div>`).join('');
}
export async function renderPage(name:string,entry?:CollectionEntry<'providers'>|CollectionEntry<'conditions'>) {
  const all=await content();
  const $=load(template(`pages/${name}`),null,false);
  const slot=(i:number,html:string)=>$(`[data-cms-slot="${i}"]`).html(html);
  if(name==='clinic-locations' || name==='surgery-locations') {
    const rows=name==='clinic-locations'?all.clinics:all.surgeryLocations;
    for(const [i,northwest] of [true,false].entries()) slot(i,`<div class="w-dyn-items w-row location-grid" role="list">${rows.filter(r=>r.data.northwest===northwest).map(r=>locationCard(r.data,name,i)).join('')}</div>`);
  }
  if(name==='contact') slot(0,`<div class="w-dyn-items w-row location-grid" role="list">${all.clinics.map(r=>contactCard(r.data)).join('')}</div>`);
  if(name==='providers') slot(0,`<div class="careers-jobs-list w-dyn-items" role="list">${all.providers.map(r=>providerCard(r.data)).join('')}</div>`);
  if(name==='index' || name==='about') {
    for(const [i,category] of ['Men','Women'].entries()) slot(i,`<div class="expertise-list w-dyn-items" role="list">${conditionList(all.conditions.filter(r=>r.data.category===category),true)}</div>`);
  }
  if(name==='index') $('[data-team-slot]').html(all.providers.filter(r=>r.data.type==='Physician').map(({data:d})=>{
    const t=load(template('cards/team'),null,false);
    t('h3').html(`<a class="link-reset" href="/providers/${d.slug}">${escape(d.name.replace(/ MD$/,''))}</a>`);
    t('img').attr('src',asset(d.homeImage || d.image || d.thumbnail)).attr('alt',d.name).removeAttr('srcset').removeAttr('sizes');
    return t.html();
  }).join('')+template('cards/team-cta'));
  if(entry?.collection==='providers') {
    const d=entry.data;
    $('h1').text(d.name);
    const bio=$('.job-content .text-rich-text');
    if(d.bio)bio.html(rich(d.bio));else bio.parent().remove();
    const fields=Object.keys(d.education);
    $('.job-content .card').each((i,el)=>{
      const value=d.education[fields[i]];
      if(value)$(el).find('p').html(rich(value));else $(el).remove();
    });
    if(!Object.values(d.education).some(Boolean)) $('.job-content > div').last().remove();
    if(!d.bio && !Object.values(d.education).some(Boolean)) $('.job-content').html(`<p class="text-size-large">${escape(d.name)} · ${escape(d.type)}</p><p>Please contact our office for provider information and appointment availability.</p>`);
    $('[data-provider-image]').attr('src',asset(d.image || d.thumbnail)).attr('alt',d.name);
    $('.job-details-list').html(`<div class="button-group small"><div class="text-meta">Role</div><div>${escape(d.type)}</div></div>`+(d.location?`<div class="button-group small"><div class="text-meta">Office locations</div><div>${escape(d.location)}</div></div>`:''));
  }
  if(entry?.collection==='conditions') {
    const d=entry.data;
    $('h1').text(d.name);$('.expertise-item-nav .text-meta').text(d.category || 'Conditions');
    $('.text-size-large').text(d.shortDescription);$('.expertise-item-content .text-rich-text').html(rich(d.body));
    slot(0,`<div class="nav w-dyn-items" role="list">${conditionList(all.conditions.filter(r=>d.category?r.data.category===d.category:true))}</div>`);
  }
  $('[class]').each((_,el)=>{$(el).removeClass('w-dyn-bind-empty');});
  const meta=metadata[name as keyof typeof metadata];
  const title=entry?`${entry.data.name} | RoMIUS Urology`:meta.title;
  const description=entry?.collection==='conditions'?entry.data.shortDescription.replace(/\s+/g,' ').slice(0,160):meta.description;
  return {html:$.html(),title,description};
}
export function shared(name:string,path:string) {
  const $=load(template(`shared/${name}`),null,false);
  $('a[href]').each((_,el)=>{if($(el).attr('href')===path)$(el).addClass('w--current').attr('aria-current','page');});
  return $.html();
}
