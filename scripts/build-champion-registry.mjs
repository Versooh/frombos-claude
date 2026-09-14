import { writeFile, mkdir, readFile } from 'node:fs/promises';

const OUT=new URL('../assets/js/champion-registry.generated.js',import.meta.url);
const DATA=new URL('../assets/js/data.js',import.meta.url);
const BASE='https://wildrift.leagueoflegends.com/en-us/champions/';
const overrides={
  "Cho'Gath":'chogath',"Dr. Mundo":'dr-mundo',"Jarvan IV":'jarvan-iv',"K'Sante":'ksante',"Kai'Sa":'kaisa',"Kha'Zix":'khazix',"Kog'Maw":'kogmaw',"Lee Sin":'lee-sin',"Master Yi":'master-yi',"Miss Fortune":'miss-fortune',"Nunu & Willump":'nunu-and-willump',"Twisted Fate":'twisted-fate',"Vel'Koz":'velkoz',"Xin Zhao":'xin-zhao',"Aurelion Sol":'aurelion-sol'
};
const slugify=n=>overrides[n]||n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const clean=s=>s.replace(/\\u002F/g,'/').replace(/\\u003A/g,':').replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/\\\//g,'/');
async function loadChampions(){
  const src=await readFile(DATA,'utf8');
  const m=src.match(/export const CHAMPIONS=(\[[\s\S]*?\]);/);
  if(!m) throw new Error('CHAMPIONS array not found in assets/js/data.js');
  return Function(`"use strict";return (${m[1]});`)();
}
function candidates(html){
  const text=clean(html);const rx=/https:\/\/(?:images\.contentstack\.io|cmsassets\.rgpub\.io)[^"'<>\\\s]+/g;
  return [...new Set(text.match(rx)||[])].map(u=>u.replace(/[),;]+$/,'').replace(/\?accountingTag=WR\?/,'?accountingTag=WR&'));
}
function dims(url){const m=decodeURIComponent(url).match(/-(\d{2,4})x(\d{2,4})\.(?:png|jpe?g|webp)/i);return m?{w:+m[1],h:+m[2]}:null;}
function isGeneric(url){return /content_organization\/20aeb6046d11ff197c4eeb93150853ddf2ff14c0/i.test(url)||/logo|favicon|social|icon[_-]?role/i.test(url);}
function portraitScore(url){
  if(isGeneric(url))return -1000;const d=dims(url);let s=0;
  if(d){const ratio=d.w/d.h;if(ratio>.86&&ratio<1.14)s+=120;else s-=60;if(d.w>=80&&d.w<=512)s+=35;}
  if(/game_data_live/i.test(url))s+=40;else if(/game_data/i.test(url))s+=34;else if(/news_live/i.test(url))s+=28;else if(/news/i.test(url))s+=20;
  if(/homepage|portrait|champion/i.test(url))s+=30;if(/skin|ability|spell|item|rune/i.test(url))s-=35;
  return s;
}
function splashScore(url){
  if(isGeneric(url))return -1000;const d=dims(url);let s=0;
  if(d){const ratio=d.w/d.h;if(ratio>=1.45)s+=110;else if(ratio>.86&&ratio<1.14)s-=35;if(d.w>=900)s+=35;}
  if(/splash|background|hero/i.test(url))s+=40;if(/game_data_live|game_data/i.test(url))s+=20;if(/96x96|128x128/i.test(url))s-=80;
  return s;
}
function choose(urls,kind){const image=urls.filter(u=>/\.(png|jpe?g|webp)(\?|$)/i.test(u));const score=kind==='portrait'?portraitScore:splashScore;return [...image].sort((a,b)=>score(b)-score(a))[0]||null;}
async function fetchChampion(name){
  const slug=slugify(name),officialUrl=`${BASE}${slug}/`;
  try{
    const r=await fetch(officialUrl,{headers:{'user-agent':'FROMBOS-Coach/1.0 (+https://github.com/Versooh/frombos-claude)'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const html=await r.text(),urls=candidates(html),portrait=choose(urls,'portrait'),splash=choose(urls,'splash');
    return{name,slug,officialUrl,portrait,splash,source:'RIOT_OFFICIAL',assetCount:urls.length,verifiedAt:new Date().toISOString()};
  }catch(error){return{name,slug,officialUrl,portrait:null,splash:null,source:'RIOT_OFFICIAL',assetCount:0,error:String(error.message||error),verifiedAt:new Date().toISOString()};}
}
async function main(){
  const CHAMPIONS=await loadChampions();const registry={};let ok=0;
  for(let i=0;i<CHAMPIONS.length;i+=5){const rows=await Promise.all(CHAMPIONS.slice(i,i+5).map(fetchChampion));for(const row of rows){registry[row.name]=row;if(row.portrait)ok++;}console.log(`registry ${Math.min(i+5,CHAMPIONS.length)}/${CHAMPIONS.length} · portraits ${ok}`);await new Promise(r=>setTimeout(r,120));}
  registry.Ahri.portrait ||= 'https://images.contentstack.io/v3/assets/blt370612131b6e0756/blta38b1f0035d35842/5f4defe95acde4125c6c6c56/Ahri_WR_Homepage.png';
  registry.Garen.portrait ||= 'https://images.contentstack.io/v3/assets/blt370612131b6e0756/blta62d7fafa8cf97e1/5f4df00c48954b6250f825f8/Garen_WR_Homepage.png';
  const duplicates=new Map();for(const [name,row] of Object.entries(registry)){if(!row.portrait)continue;const key=row.portrait.split('?')[0];const list=duplicates.get(key)||[];list.push(name);duplicates.set(key,list);}
  const bad=[...duplicates.entries()].filter(([,names])=>names.length>3);if(bad.length)throw new Error(`portrait validation failed: duplicated generic asset detected for ${bad[0][1].slice(0,6).join(', ')}`);
  const portraits=Object.values(registry).filter(x=>x.portrait).length;if(portraits<120)throw new Error(`portrait coverage too low: ${portraits}/${CHAMPIONS.length}`);
  await mkdir(new URL('../assets/js/',import.meta.url),{recursive:true});
  await writeFile(OUT,`// Generated at deploy from Riot Wild Rift champion pages.\nexport const CHAMPION_REGISTRY=${JSON.stringify(registry,null,2)};\nexport const CHAMPION_REGISTRY_META=${JSON.stringify({generatedAt:new Date().toISOString(),total:CHAMPIONS.length,portraits,source:BASE,validation:'real-portrait-v3'})};\n`);
  console.log(`Champion registry complete: ${portraits}/${CHAMPIONS.length} validated portraits.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
