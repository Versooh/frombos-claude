import { writeFile, mkdir, readFile } from 'node:fs/promises';

const OUT=new URL('../assets/js/champion-registry.generated.js',import.meta.url);
const DATA=new URL('../assets/js/data.js',import.meta.url);
const ROOT='https://wildrift.leagueoflegends.com';
const BASE=`${ROOT}/en-us/champions/`;
const UA='FROMBOS-Coach/1.0 (+https://github.com/Versooh/frombos-claude)';
const overrides={
  "Cho'Gath":'chogath',"Dr. Mundo":'dr-mundo',"Jarvan IV":'jarvan-iv',"K'Sante":'ksante',"Kai'Sa":'kaisa',"Kha'Zix":'khazix',"Kog'Maw":'kogmaw',"Lee Sin":'lee-sin',"Master Yi":'master-yi',"Miss Fortune":'miss-fortune',"Nunu & Willump":'nunu-and-willump',"Twisted Fate":'twisted-fate',"Vel'Koz":'velkoz',"Xin Zhao":'xin-zhao',"Aurelion Sol":'aurelion-sol'
};
const slugify=n=>overrides[n]||n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const clean=s=>s.replace(/\\u002F/g,'/').replace(/\\u003A/g,':').replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/\\\//g,'/');
async function loadChampions(){const src=await readFile(DATA,'utf8'),m=src.match(/export const CHAMPIONS=(\[[\s\S]*?\]);/);if(!m)throw new Error('CHAMPIONS array not found');return Function(`"use strict";return (${m[1]});`)();}
function candidates(html){const text=clean(html),rx=/https:\/\/(?:images\.contentstack\.io|cmsassets\.rgpub\.io)[^"'<>\\\s]+/g;return [...new Set(text.match(rx)||[])].map(u=>u.replace(/[),;]+$/,''));}
function dims(url){const m=decodeURIComponent(url).match(/-(\d{2,4})x(\d{2,4})\.(?:png|jpe?g|webp|avif)/i);return m?{w:+m[1],h:+m[2]}:null;}
function forbidden(url){return /(?:item|items|ability|abilities|spell|rune|perk|icon[_-]?role|favicon|logo|social|content_organization\/20aeb6046d11ff197c4eeb93150853ddf2ff14c0)/i.test(decodeURIComponent(url));}
function heroScore(url){
  if(forbidden(url))return -9999;const d=dims(url);let s=0;
  if(d){const ratio=d.w/d.h;if(d.w>=1000&&ratio>=1.45)s+=500;else if(d.w>=700&&ratio>=1.35)s+=260;else if(ratio>.85&&ratio<1.15)s-=500;if(d.w<=512&&d.h<=512)s-=300;}
  if(/1280x720|1920x1080|1600x900/i.test(url))s+=320;
  if(/game_data_live|game_data/i.test(url))s+=80;if(/splash|background|hero/i.test(url))s+=120;
  if(/96x96|128x128|256x256|512x512/i.test(url))s-=400;
  return s;
}
function chooseHero(html){const all=candidates(html).filter(u=>/\.(?:png|jpe?g|webp|avif)(?:\?|$)/i.test(u));if(!all.length)return null;const ranked=[...all].sort((a,b)=>heroScore(b)-heroScore(a));return heroScore(ranked[0])>100?ranked[0]:null;}
async function fetchHtml(url){const r=await fetch(url,{headers:{'user-agent':UA,'accept':'text/html,application/xhtml+xml'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.text();}
async function resolveChampion(name){
  const slug=slugify(name),locales=['en-us','en-gb','pt-br'];let lastError='';
  for(const locale of locales){const officialUrl=`${ROOT}/${locale}/champions/${slug}/`;try{const html=await fetchHtml(officialUrl),hero=chooseHero(html);if(hero)return{name,slug,officialUrl:`${BASE}${slug}/`,portrait:hero,splash:hero,source:'RIOT_OFFICIAL',portraitOrigin:'RIOT_CHAMPION_HERO',resolvedLocale:locale,verifiedAt:new Date().toISOString()};lastError=`no hero in ${locale}`;}catch(e){lastError=`${locale}: ${e.message||e}`;}}
  return{name,slug,officialUrl:`${BASE}${slug}/`,portrait:null,splash:null,source:'RIOT_OFFICIAL',portraitOrigin:null,error:lastError,verifiedAt:new Date().toISOString()};
}
async function main(){
  const CHAMPIONS=await loadChampions(),registry={};let ok=0;
  for(let i=0;i<CHAMPIONS.length;i+=5){const rows=await Promise.all(CHAMPIONS.slice(i,i+5).map(resolveChampion));for(const row of rows){registry[row.name]=row;if(row.portrait)ok++;}console.log(`registry ${Math.min(i+5,CHAMPIONS.length)}/${CHAMPIONS.length} · champion arts ${ok}`);await new Promise(r=>setTimeout(r,100));}
  const rows=Object.entries(registry).filter(([,r])=>r.portrait);const unique=new Map();for(const [name,row] of rows){const key=row.portrait.split('?')[0],a=unique.get(key)||[];a.push(name);unique.set(key,a);}
  const dup=[...unique.values()].find(names=>names.length>2);if(dup)throw new Error(`duplicate champion art detected: ${dup.join(', ')}`);
  const bad=rows.find(([,r])=>forbidden(r.portrait)||((dims(r.portrait)?.w||0)<=512&&(dims(r.portrait)?.h||0)<=512));if(bad)throw new Error(`thumbnail/item asset rejected: ${bad[0]} -> ${bad[1].portrait}`);
  if(rows.length<135)throw new Error(`champion art coverage too low: ${rows.length}/${CHAMPIONS.length}`);
  await mkdir(new URL('../assets/js/',import.meta.url),{recursive:true});const meta={generatedAt:new Date().toISOString(),total:CHAMPIONS.length,portraits:rows.length,source:BASE,validation:'official-champion-hero-v5',note:'Portrait cards use official large champion hero/splash art cropped by the UI; square ability/item thumbnails are rejected.'};
  await writeFile(OUT,`// Generated from Riot Wild Rift champion pages. Large official champion hero art only.\nexport const CHAMPION_REGISTRY=${JSON.stringify(registry,null,2)};\nexport const CHAMPION_REGISTRY_META=${JSON.stringify(meta)};\n`);
  console.log(`Champion art registry complete: ${rows.length}/${CHAMPIONS.length}. No square item/ability thumbnails.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
