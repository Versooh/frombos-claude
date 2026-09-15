// FROMBOS V20.12 — Matchup/Build evidence navigation + Series command flow.
// Reads only existing Wild Rift workspace state and rendered provenance. No metric is inferred.

import { CHAMPIONS } from './data.js';
import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const selectedChampion=()=>{const raw=location.hash.split('?')[1]||'';return new URLSearchParams(raw).get('champion')||CHAMPIONS[0]||'';};
const championHref=(page,name)=>`#/${page}?champion=${encodeURIComponent(name)}`;

function evidenceState(root){
  const labels=qa('.intel-state-head .badge',root).map(node=>node.textContent.trim()).filter(Boolean);
  const set=new Set(labels);
  if(q('.meta-source',root))set.add('CURATED');
  return ['OFFICIAL','OBSERVED','CURATED','FROMBOS_STRUCTURAL','UNKNOWN'].map(type=>({type,present:set.has(type)}));
}
function ensureIntelLabFlow(){
  const page=route();if(!['matchups','builds'].includes(page))return;
  const root=q('.content .intel-lab');const hero=root&&q('.lab-hero',root);if(!root||!hero)return;
  let flow=q('.intel-lab-flow-v20',root);if(!flow){flow=document.createElement('section');flow.className='intel-lab-flow-v20';hero.after(flow);}
  const current=selectedChampion();const index=Math.max(0,CHAMPIONS.indexOf(current));
  const previous=CHAMPIONS[(index-1+CHAMPIONS.length)%CHAMPIONS.length]||current;
  const next=CHAMPIONS[(index+1)%CHAMPIONS.length]||current;
  const evidence=evidenceState(root);const signature=[page,current,...evidence.map(item=>`${item.type}:${item.present}`)].join('|');
  if(flow.dataset.signature===signature)return;flow.dataset.signature=signature;
  flow.innerHTML=`<div class="intel-lab-nav-v20"><button type="button" class="btn" data-intel-champ-nav="prev" title="${esc(previous)}">←</button><div><small>${page==='matchups'?'MATCHUP LAB':'BUILD INTELLIGENCE'} · ${index+1}/${CHAMPIONS.length}</small><b>${esc(current)}</b></div><button type="button" class="btn" data-intel-champ-nav="next" title="${esc(next)}">→</button></div><div class="intel-lab-tabs-v20" role="navigation" aria-label="Inteligência do campeão"><a href="${championHref('champions',current)}">Champion</a><a href="${championHref('matchups',current)}" aria-current="${page==='matchups'?'page':'false'}">Matchups</a><a href="${championHref('builds',current)}" aria-current="${page==='builds'?'page':'false'}">Builds</a></div><div class="intel-lab-evidence-v20" aria-label="Camadas de evidência presentes">${evidence.map(item=>`<span data-layer="${item.type}" data-present="${item.present?'1':'0'}"><i></i>${item.type}</span>`).join('')}</div>`;
  q('[data-intel-champ-nav="prev"]',flow)?.addEventListener('click',()=>location.hash=championHref(page,previous).slice(1));
  q('[data-intel-champ-nav="next"]',flow)?.addEventListener('click',()=>location.hash=championHref(page,next).slice(1));
}

function fearlessLabel(mode){return mode==='global'?'Global':mode==='team'?'Por equipe':'Desligado';}
function seriesGames(){const format=store.state.draft?.format||'MD5';return Array.from({length:format==='MD3'?3:5},(_,index)=>index+1);}
function gameState(game){
  const actions=store.state.draft?.games?.[game]?.actions||[];
  const picks=actions.filter(action=>action.type==='pick').length;
  const bans=actions.filter(action=>action.type==='ban').length;
  return {actions:actions.length,picks,bans,complete:actions.length>=20};
}
function ensureSeriesFlow(){
  if(route()!=='series')return;
  const content=q('.content[data-page="series"]')||q('.content');const grid=content&&q('.grid.cols-3',content);if(!content||!grid)return;
  const games=seriesGames();const states=games.map(game=>({game,...gameState(game)}));const draft=store.state.draft||{};
  let flow=q('.series-command-v20',content);if(!flow){flow=document.createElement('section');flow.className='series-command-v20';grid.before(flow);}
  const signature=[draft.format,draft.fearlessMode,draft.game,...states.flatMap(item=>[item.actions,item.picks,item.bans])].join('|');
  if(flow.dataset.signature!==signature){
    flow.dataset.signature=signature;
    const activeGame=Math.min(Number(draft.game)||1,games.length);
    const touched=states.filter(item=>item.actions>0).length;const completed=states.filter(item=>item.complete).length;
    flow.innerHTML=`<div class="series-command-main-v20"><span>SERIES COMMAND</span><b>${esc(draft.format||'MD5')} · Fearless ${esc(fearlessLabel(draft.fearlessMode))}</b><small>Estado local da série — sem projeção de vitória.</small></div><div class="series-command-kpis-v20"><span><small>JOGOS COM ESTADO</small><b>${touched}/${games.length}</b></span><span><small>DRAFTS COMPLETOS</small><b>${completed}</b></span><span><small>JOGO ATIVO</small><b>G${activeGame}</b></span></div><div class="series-command-games-v20">${states.map(item=>`<button type="button" data-series-open="${item.game}" aria-current="${item.game===activeGame?'true':'false'}"><small>G${item.game}</small><b>${item.actions}/20</b><span>${item.picks}P · ${item.bans}B</span></button>`).join('')}</div>`;
    qa('[data-series-open]',flow).forEach(button=>button.addEventListener('click',()=>q(`[data-open-game="${button.dataset.seriesOpen}"]`,grid)?.click()));
  }
  qa('[data-open-game]',grid).forEach(button=>{
    const card=button.closest('article.card');if(!card)return;const state=gameState(Number(button.dataset.openGame));
    card.dataset.seriesGame=button.dataset.openGame;card.dataset.seriesState=state.complete?'complete':state.actions?'active':'empty';
  });
}

function apply(){ensureIntelLabFlow();ensureSeriesFlow();}
function bindRuntime(){
  const runtime=window.FROMBOS_V20_RUNTIME;
  if(runtime?.subscribe){runtime.subscribe(apply);return;}
  let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});};
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();
}
bindRuntime();

window.FROMBOS_INTEL_SERIES_FLOW_V20={apply};
