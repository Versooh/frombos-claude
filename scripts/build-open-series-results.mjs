import { writeFile } from 'node:fs/promises';

const OUT=new globalThis.URL('../assets/js/open-series-results.generated.js',import.meta.url);
const PAGE_URL='https://www.openseries.com.br/tabelas/';
const UA='FROMBOS-Coach/1.0 (+https://github.com/Versooh/frombos-claude)';
function decodeHtml(value=''){
  const named={amp:'&',quot:'"',apos:"'",nbsp:' ',lt:'<',gt:'>'};
  return value.replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&([a-z]+);/gi,(m,n)=>named[n.toLowerCase()]??m);
}
function linesFromHtml(html){
  const withBreaks=html.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/(?:div|p|li|h[1-6]|td|tr|section|article)>/gi,'\n');
  return decodeHtml(withBreaks.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ')).split(/\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
}
function parseMatches(html){
  const lines=linesFromHtml(html),matches=[];let group='';
  for(let i=0;i<lines.length;i++){
    if(/^GRUPO\s+[A-H]$/i.test(lines[i])){group=lines[i].toUpperCase();continue;}
    const score=lines[i].match(/^(\d+)\s*x\s*(\d+)$/i);if(!score||!group)continue;
    const teamA=lines[i-1],teamB=lines[i+1];if(!teamA||!teamB||/^GRUPO\s+/i.test(teamA)||/^GRUPO\s+/i.test(teamB))continue;
    matches.push({id:`${group.replace(/\s+/g,'-').toLowerCase()}-${matches.length+1}`,group,teamA,scoreA:Number(score[1]),scoreB:Number(score[2]),teamB});
  }
  return matches;
}
async function main(){
  try{
    const r=await fetch(PAGE_URL,{headers:{'user-agent':UA,'accept':'text/html,application/xhtml+xml'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const matches=parseMatches(await r.text());if(matches.length<70)throw new Error(`coverage too low: ${matches.length} matches`);
    const meta={source:'Open Series',type:'OBSERVED_COMPETITIVE',retrievedAt:new Date().toISOString().slice(0,10),generatedAt:new Date().toISOString(),url:PAGE_URL,coverage:matches.length,notes:'Public group match results in source order. Page does not expose match dates or per-game draft sequence, so this registry does not infer recency, picks, bans, side or Fearless.'};
    const out=`// Generated at deploy from Open Series public match results.\nexport const OPEN_SERIES_RESULTS_META=${JSON.stringify(meta,null,2)};\nexport const OPEN_SERIES_MATCHES=${JSON.stringify(matches,null,2)};\nexport const matchesForTeam=team=>OPEN_SERIES_MATCHES.filter(x=>x.teamA===team||x.teamB===team);\nexport const resultForTeam=(m,team)=>{const own=m.teamA===team?m.scoreA:m.scoreB,opp=m.teamA===team?m.scoreB:m.scoreA;return own>opp?'W':own<opp?'L':'D';};\n`;
    await writeFile(OUT,out);console.log(`Open Series results registry complete: ${matches.length} matches.`);
  }catch(error){console.warn(`Open Series results refresh skipped; committed fallback retained: ${error.message||error}`);}
}
main();
