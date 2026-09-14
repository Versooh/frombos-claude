import { writeFile } from 'node:fs/promises';

const OUT=new URL('../assets/js/open-series-scouting.generated.js',import.meta.url);
const RANKINGS='https://www.openseries.com.br/rankings/';
const TEAMS='https://www.openseries.com.br/equipes/';
const UA='FROMBOS-Coach/1.0 (+https://github.com/Versooh/frombos-claude)';

function decodeHtml(value=''){
  const named={amp:'&',quot:'"',apos:"'",nbsp:' ',lt:'<',gt:'>'};
  return value.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&([a-z]+);/gi,(m,n)=>named[n.toLowerCase()]??m);
}
function text(value=''){return decodeHtml(value.replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();}
function num(v){const n=Number(String(v).replace('%','').replace(',','.').trim());return Number.isFinite(n)?n:null;}
function int(v){const m=String(v).match(/-?\d+/);return m?Number(m[0]):null;}
async function get(url){const r=await fetch(url,{headers:{'user-agent':UA,'accept':'text/html,application/xhtml+xml'}});if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);return r.text();}
function parsePlayers(html){
  const out=[];
  for(const tr of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const cells=[...tr[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x=>text(x[1]));
    if(cells.length<9)continue;
    const rank=int(cells[0]);if(!rank||!cells[1]||/jogador/i.test(cells[1]))continue;
    const wr=String(cells[4]).match(/([\d.,]+)%\s*\((\d+)W\/(\d+)L\)/i);
    const total=String(cells[6]).split('/').map(int);
    if(!wr||total.length<3)continue;
    out.push({rank,name:cells[1],team:cells[2],games:int(cells[3])??0,winRate:num(wr[1])??0,wins:Number(wr[2]),losses:Number(wr[3]),kda:num(cells[5])??0,totalK:total[0]??0,totalD:total[1]??0,totalA:total[2]??0,avgGold:cells[7],favorite:cells[8]});
  }
  return [...new Map(out.map(x=>[x.name,x])).values()].sort((a,b)=>a.rank-b.rank);
}
function parseLineups(html){
  const normalized=html.replace(/\r/g,'');
  const headings=[...normalized.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)];
  const lineups={};
  for(let i=0;i<headings.length;i++){
    const team=text(headings[i][1]);if(!team)continue;
    const start=headings[i].index+headings[i][0].length;
    const end=i+1<headings.length?headings[i+1].index:normalized.length;
    const block=normalized.slice(start,end);
    if(!/Lineup/i.test(text(block.slice(0,600))))continue;
    const players=[...block.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(x=>text(x[1])).filter(Boolean).filter(x=>!/lineup/i.test(x));
    if(players.length>=5&&players.length<=12)lineups[team]=[...new Set(players)];
  }
  return lineups;
}
async function main(){
  try{
    const [rankingsHtml,teamsHtml]=await Promise.all([get(RANKINGS),get(TEAMS)]);
    const players=parsePlayers(rankingsHtml),lineups=parseLineups(teamsHtml);
    if(players.length<50)throw new Error(`player coverage too low: ${players.length}`);
    if(Object.keys(lineups).length<16)throw new Error(`team coverage too low: ${Object.keys(lineups).length}`);
    const meta={source:'Open Series',type:'OBSERVED_COMPETITIVE',retrievedAt:new Date().toISOString().slice(0,10),generatedAt:new Date().toISOString(),rankingsUrl:RANKINGS,teamsUrl:TEAMS,playersCoverage:players.length,teamsCoverage:Object.keys(lineups).length,notes:'Public rankings and registered lineups. Champion favorite is source-published and is not equivalent to a complete champion pool.'};
    const out=`// Generated at deploy from Open Series public rankings and team lineups.\nexport const OPEN_SERIES_SCOUTING_META=${JSON.stringify(meta,null,2)};\nexport const OPEN_SERIES_PLAYERS=${JSON.stringify(players,null,2)};\nexport const OPEN_SERIES_LINEUPS=${JSON.stringify(lineups,null,2)};\nexport const playersForTeam=team=>OPEN_SERIES_PLAYERS.filter(x=>x.team===team).sort((a,b)=>a.rank-b.rank);\nexport const lineupForTeam=team=>OPEN_SERIES_LINEUPS[team]||[];\n`;
    await writeFile(OUT,out);console.log(`Open Series scouting registry complete: ${players.length} players · ${Object.keys(lineups).length} teams.`);
  }catch(error){console.warn(`Open Series scouting refresh skipped; committed fallback retained: ${error.message||error}`);}
}
main();
