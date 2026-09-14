import { writeFile } from 'node:fs/promises';

const OUT=new globalThis.URL('../assets/js/open-series-champions.generated.js',import.meta.url);
const PAGE_URL='https://www.openseries.com.br/campeoes/';
const USER_AGENT='FROMBOS-Coach/1.0 (+https://github.com/Versooh/frombos-claude)';

function decodeHtml(value=''){
  const named={amp:'&',quot:'"',apos:"'",nbsp:' ',lt:'<',gt:'>'};
  return value
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
    .replace(/&([a-z]+);/gi,(m,n)=>named[n.toLowerCase()]??m);
}
function text(value=''){
  return decodeHtml(value.replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
}
function number(value){const n=Number(String(value).replace('%','').replace(',','.').trim());return Number.isFinite(n)?n:null;}
function integer(value){const m=String(value).match(/-?\d+/);return m?Number(m[0]):null;}
function parseRow(cells){
  if(cells.length<10)return null;
  const rank=integer(cells[0]);
  const name=cells[1]?.trim();
  if(!rank||!name||/campe[aã]o/i.test(name))return null;
  const wr=String(cells[6]).match(/([\d.,]+)%\s*\((\d+)W\/(\d+)L\)/i);
  const kdaAvg=String(cells[8]).split('/').map(number);
  if(!wr||kdaAvg.length<3)return null;
  return {
    rank,name,
    picks:integer(cells[2])??0,pickRate:number(cells[3])??0,
    bans:integer(cells[4])??0,banRate:number(cells[5])??0,
    winRate:number(wr[1])??0,wins:Number(wr[2]),losses:Number(wr[3]),
    kda:number(cells[7])??0,avgK:kdaAvg[0]??0,avgD:kdaAvg[1]??0,avgA:kdaAvg[2]??0,
    avgGold:String(cells[9]).trim()
  };
}
function parseTable(html){
  const rows=[];
  const trRx=/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  for(const match of html.matchAll(trRx)){
    const cells=[...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x=>text(x[1]));
    const row=parseRow(cells);if(row)rows.push(row);
  }
  return [...new Map(rows.map(x=>[x.name,x])).values()].sort((a,b)=>a.rank-b.rank);
}
async function main(){
  try{
    const response=await fetch(PAGE_URL,{headers:{'user-agent':USER_AGENT,'accept':'text/html,application/xhtml+xml'}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const html=await response.text();
    const rows=parseTable(html);
    if(rows.length<100)throw new Error(`coverage too low: ${rows.length} rows`);
    const meta={source:'Open Series',type:'OBSERVED_COMPETITIVE',event:'Open Series · 2º Split 2026',retrievedAt:new Date().toISOString().slice(0,10),generatedAt:new Date().toISOString(),url:PAGE_URL,championsUsed:124,coverage:rows.length,notes:'Tournament aggregate. Win rate is among picks only; pick/ban rates are source-published tournament rates. Not role-resolved. Rates are not recalculated from the separate 152-game summary because the source scopes differ.'};
    const out=`// Generated at deploy from the public Open Series champion statistics page.\nexport const OPEN_SERIES_CHAMPION_META=${JSON.stringify(meta,null,2)};\nexport const OPEN_SERIES_CHAMPIONS=${JSON.stringify(rows,null,2)};\nexport const openSeriesChampion=name=>OPEN_SERIES_CHAMPIONS.find(x=>x.name===name)||null;\nexport const topOpenSeries=(field='picks',limit=12)=>[...OPEN_SERIES_CHAMPIONS].sort((a,b)=>(b[field]??0)-(a[field]??0)).slice(0,limit);\n`;
    await writeFile(OUT,out);
    console.log(`Open Series champion registry complete: ${rows.length}/124 rows.`);
  }catch(error){
    console.warn(`Open Series registry refresh skipped; committed fallback retained: ${error.message||error}`);
  }
}
main();
