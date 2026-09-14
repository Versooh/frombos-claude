import { writeFile, mkdir, readFile } from 'node:fs/promises';

const OUT=new URL('../assets/js/champion-registry.generated.js',import.meta.url);
const DATA=new URL('../assets/js/data.js',import.meta.url);
const BASE='https://wildrift.leagueoflegends.com/en-us/champions/';
const UA='FROMBOS-Coach/1.0 (+https://github.com/Versooh/frombos-claude)';
const overrides={
  "Cho'Gath":'chogath',"Dr. Mundo":'dr-mundo',"Jarvan IV":'jarvan-iv',"K'Sante":'ksante',"Kai'Sa":'kaisa',"Kha'Zix":'khazix',"Kog'Maw":'kogmaw',"Lee Sin":'lee-sin',"Master Yi":'master-yi',"Miss Fortune":'miss-fortune',"Nunu & Willump":'nunu-and-willump',"Twisted Fate":'twisted-fate',"Vel'Koz":'velkoz',"Xin Zhao":'xin-zhao',"Aurelion Sol":'aurelion-sol'
};
const slugify=n=>overrides[n]||n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const clean=s=>s.replace(/\\u002F/g,'/').replace(/\\u003A/g,':').replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/\\\//g,'/');
async function loadChampions(){
  const src=await readFile(DATA,'utf8');const m=src.match(/export const CHAMPIONS=(\[[\s\S]*?\]);/);
  if(!m)throw new Error('CHAMPIONS array not found');return Function(`"use strict";return (${m[1]});`)();
}
function urls(html){const text=clean(html);const rx=/https:\/\/(?:images\.contentstack\.io|cmsassets\.rgpub\.io)[^"'<>\\\s]+/g;return [...new Set(text.match(rx)||[])].map(u=>u.replace(/[),;]+$/,''));}
function isImage(u){return /\.(png|jpe?g|webp|avif)(\?|$)/i.test(u);}
function isForbidden(u){return /(?:item|items|ability|abilities|spell|rune|perk|icon[_-]?role|favicon|logo|social|content_organization\/20aeb6046d11ff197c4eeb93150853ddf2ff14c0)/i.test(decodeURIComponent(u));}
function metaImage(html){
  const text=clean(html);const tags=[...text.matchAll(/<meta\b[^>]*>/gi)].map(x=>x[0]);
  for(const tag of tags){if(!/(?:property|name)=["']og:image["']/i.test(tag))continue;const m=tag.match(/content=["']([^"']+)["']/i);if(m&&isImage(m[1])&&!isForbidden(m[1]))return m[1];}
  return null;
}
function listingCard(listingHtml,slug){
  const text=clean(listingHtml);const needles=[`/en-us/champions/${slug}/`,`/en-us/champions/${slug}`];let at=-1;
  for(const n of needles){at=text.indexOf(n);if(at>=0)break;}if(at<0)return null;
  const start=Math.max(0,text.lastIndexOf('<a',at));let end=text.indexOf('</a>',at);if(end<0||end-start>18000)end=Math.min(text.length,at+12000);
  const chunk=text.slice(start,end+4),candidates=urls(chunk).filter(isImage).filter(u=>!isForbidden(u));
  const preferred=candidates.find(u=>/(?:champion|champions|card|thumbnail|portrait|listing|grid|homepage)/i.test(u));
  return preferred||candidates[0]||null;
}
async function fetchPage(url){const r=await fetch(url,{headers:{'user-agent':UA,'accept':'text/html'}});if(!r.ok)throw new Error(`HTTP ${r.status} ${url}`);return r.text();}
async function main(){
  const CHAMPIONS=await loadChampions();const listing=await fetchPage(BASE);const registry={};let ok=0,fromGrid=0,fromOg=0;
  for(let i=0;i<CHAMPIONS.length;i+=5){
    const batch=CHAMPIONS.slice(i,i+5);const rows=await Promise.all(batch.map(async name=>{
      const slug=slugify(name),officialUrl=`${BASE}${slug}/`;let portrait=listingCard(listing,slug),splash=null,origin=portrait?'RIOT_CHAMPION_GRID':null;
      try{const html=await fetchPage(officialUrl);const og=metaImage(html);splash=og;if(!portrait&&og){portrait=og;origin='RIOT_OG_IMAGE';}}
      catch(error){return{name,slug,officialUrl,portrait,splash,source:'RIOT_OFFICIAL',portraitOrigin:origin,error:String(error.message||error),verifiedAt:new Date().toISOString()};}
      return{name,slug,officialUrl,portrait,splash,source:'RIOT_OFFICIAL',portraitOrigin:origin,verifiedAt:new Date().toISOString()};
    }));
    for(const row of rows){registry[row.name]=row;if(row.portrait){ok++;if(row.portraitOrigin==='RIOT_CHAMPION_GRID')fromGrid++;else if(row.portraitOrigin==='RIOT_OG_IMAGE')fromOg++;}}
    console.log(`registry ${Math.min(i+5,CHAMPIONS.length)}/${CHAMPIONS.length} · portraits ${ok} · grid ${fromGrid} · og ${fromOg}`);await new Promise(r=>setTimeout(r,100));
  }
  const portraitRows=Object.entries(registry).filter(([,x])=>x.portrait);const unique=new Map();for(const [name,row] of portraitRows){const k=row.portrait.split('?')[0];const a=unique.get(k)||[];a.push(name);unique.set(k,a);}
  const duplicates=[...unique.values()].filter(x=>x.length>2);if(duplicates.length)throw new Error(`portrait validation failed: duplicate asset used by ${duplicates[0].join(', ')}`);
  const forbidden=portraitRows.filter(([,x])=>isForbidden(x.portrait));if(forbidden.length)throw new Error(`forbidden item/ability asset detected: ${forbidden[0][0]}`);
  if(portraitRows.length<130)throw new Error(`portrait coverage too low: ${portraitRows.length}/${CHAMPIONS.length}`);
  if(fromGrid<100)throw new Error(`official grid extraction too low: ${fromGrid}/${CHAMPIONS.length}`);
  await mkdir(new URL('../assets/js/',import.meta.url),{recursive:true});
  const meta={generatedAt:new Date().toISOString(),total:CHAMPIONS.length,portraits:portraitRows.length,gridPortraits:fromGrid,ogFallbacks:fromOg,source:BASE,validation:'official-grid-v4'};
  await writeFile(OUT,`// Generated from Riot Wild Rift official Champions grid; og:image only as fallback.\nexport const CHAMPION_REGISTRY=${JSON.stringify(registry,null,2)};\nexport const CHAMPION_REGISTRY_META=${JSON.stringify(meta)};\n`);
  console.log(`Champion registry complete: ${portraitRows.length}/${CHAMPIONS.length}; official grid ${fromGrid}; OG fallback ${fromOg}.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
