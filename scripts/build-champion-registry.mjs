import { writeFile, mkdir } from 'node:fs/promises';
import { CHAMPIONS } from '../assets/js/data.js';

const OUT=new URL('../assets/js/champion-registry.generated.js',import.meta.url);
const BASE='https://wildrift.leagueoflegends.com/en-us/champions/';
const overrides={
  "Cho'Gath":'chogath',"Dr. Mundo":'dr-mundo',"Jarvan IV":'jarvan-iv',"K'Sante":'ksante',"Kai'Sa":'kaisa',"Kha'Zix":'khazix',"Kog'Maw":'kogmaw',"Lee Sin":'lee-sin',"Master Yi":'master-yi',"Miss Fortune":'miss-fortune',"Nunu & Willump":'nunu-and-willump',"Twisted Fate":'twisted-fate',"Vel'Koz":'velkoz',"Xin Zhao":'xin-zhao',"Aurelion Sol":'aurelion-sol'
};
const slugify=n=>overrides[n]||n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/['’]/g,'').replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const token=n=>n.toLowerCase().replace(/[^a-z0-9]/g,'');
const clean=s=>s.replace(/\\u002F/g,'/').replace(/\\u003A/g,':').replace(/\\u0026/g,'&').replace(/&amp;/g,'&').replace(/\\\//g,'/');
function candidates(html){
  const text=clean(html);
  const rx=/https:\/\/(?:images\.contentstack\.io|cmsassets\.rgpub\.io)[^"'<>\\\s]+/g;
  return [...new Set(text.match(rx)||[])].map(u=>u.replace(/[),;]+$/,''));
}
function choose(urls,name,kind){
  const t=token(name);
  const image=urls.filter(u=>/\.(png|jpe?g|webp)(\?|$)/i.test(u));
  const champ=image.filter(u=>token(decodeURIComponent(u)).includes(t));
  const pool=champ.length?champ:image;
  const patterns=kind==='portrait'?[/homepage/i,/portrait/i,/champion.*\.png/i]:[/splash/i,/background/i,/hero/i];
  for(const p of patterns){const found=pool.find(u=>p.test(u));if(found)return found;}
  return pool.find(u=>kind==='portrait'?/\.png(\?|$)/i.test(u):/\.jpe?g(\?|$)/i.test(u))||null;
}
async function fetchChampion(name){
  const slug=slugify(name), officialUrl=`${BASE}${slug}/`;
  try{
    const r=await fetch(officialUrl,{headers:{'user-agent':'FROMBOS-Coach/1.0 (+https://github.com/Versooh/frombos-claude)'}});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const html=await r.text(), urls=candidates(html);
    return {name,slug,officialUrl,portrait:choose(urls,name,'portrait'),splash:choose(urls,name,'splash'),source:'RIOT_OFFICIAL',assetCount:urls.length,verifiedAt:new Date().toISOString()};
  }catch(error){return {name,slug,officialUrl,portrait:null,splash:null,source:'RIOT_OFFICIAL',assetCount:0,error:String(error.message||error),verifiedAt:new Date().toISOString()};}
}
async function main(){
  const registry={}; let ok=0;
  for(let i=0;i<CHAMPIONS.length;i+=5){
    const batch=CHAMPIONS.slice(i,i+5);
    const rows=await Promise.all(batch.map(fetchChampion));
    for(const row of rows){registry[row.name]=row;if(row.portrait)ok++;}
    console.log(`registry ${Math.min(i+5,CHAMPIONS.length)}/${CHAMPIONS.length} · portraits ${ok}`);
    await new Promise(r=>setTimeout(r,120));
  }
  // Known official Contentstack fallbacks recovered from Riot's Wild Rift assets.
  registry.Ahri.portrait ||= 'https://images.contentstack.io/v3/assets/blt370612131b6e0756/blta38b1f0035d35842/5f4defe95acde4125c6c6c56/Ahri_WR_Homepage.png';
  registry.Ahri.splash ||= 'https://images.contentstack.io/v3/assets/blt370612131b6e0756/blta38b1f0035d35842/5f4defe95acde4125c6c6c56/Ahri_WR_Splash.jpg';
  registry.Garen.portrait ||= 'https://images.contentstack.io/v3/assets/blt370612131b6e0756/blta62d7fafa8cf97e1/5f4df00c48954b6250f825f8/Garen_WR_Homepage.png';
  registry.Garen.splash ||= 'https://images.contentstack.io/v3/assets/blt370612131b6e0756/blta62d7fafa8cf97e1/5f4df00c48954b6250f825f8/Garen_WR_Splash.jpg';
  await mkdir(new URL('../assets/js/',import.meta.url),{recursive:true});
  await writeFile(OUT,`// Generated at deploy from Riot Wild Rift champion pages.\nexport const CHAMPION_REGISTRY=${JSON.stringify(registry,null,2)};\nexport const CHAMPION_REGISTRY_META=${JSON.stringify({generatedAt:new Date().toISOString(),total:CHAMPIONS.length,portraits:Object.values(registry).filter(x=>x.portrait).length,source:BASE})};\n`);
  console.log(`Champion registry complete: ${Object.values(registry).filter(x=>x.portrait).length}/${CHAMPIONS.length} portraits.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
