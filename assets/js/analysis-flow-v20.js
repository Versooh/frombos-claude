// FROMBOS V20.11 — focus/navigation layer for Tactical Board and VOD Review.
// Uses only local workspace state and existing controls. No competitive metric is inferred.

import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function activeScenario(){
  const tactical=store.state.tactical;
  if(!tactical?.scenarios?.length)return null;
  return tactical.scenarios.find(item=>item.id===tactical.activeScenario)||tactical.scenarios[0];
}
function setScenario(id){
  const select=q('#tbScenario');if(!select||!id)return;
  select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));
}
function coachCompletion(scenario){
  const coach=scenario?.coach||{};
  const fields=[coach.winCondition,coach.strongSide,coach.firstObjective,coach.avoid];
  return {filled:fields.filter(value=>String(value||'').trim()).length,total:fields.length,tags:Array.isArray(coach.tags)?coach.tags.length:0};
}
function tacticalFocus(){
  if(route()!=='tactical')return;
  const shell=q('.tactical-shell');const grid=shell&&q('.tactical-grid',shell);const context=shell&&q('.tactical-analysis-v20',shell);
  if(!shell||!grid||!context)return;
  let bar=q('.analysis-focus-v20.tactical-focus-v20',shell);
  if(!bar){
    bar=document.createElement('section');bar.className='analysis-focus-v20 tactical-focus-v20';context.after(bar);
    shell.dataset.focusV20='map';
  }
  const tactical=store.state.tactical||{};const scenarios=tactical.scenarios||[];const scenario=activeScenario();
  const index=Math.max(0,scenarios.findIndex(item=>item.id===scenario?.id));
  const previous=scenarios.length?scenarios[(index-1+scenarios.length)%scenarios.length]:null;
  const next=scenarios.length?scenarios[(index+1)%scenarios.length]:null;
  const completion=coachCompletion(scenario);
  const signature=[scenario?.id,index,scenarios.length,completion.filled,completion.tags,shell.dataset.focusV20].join('|');
  if(bar.dataset.signature===signature)return;
  bar.dataset.signature=signature;
  const focus=shell.dataset.focusV20||'map';
  bar.innerHTML=`<div class="analysis-focus-main-v20"><span>FOCO DE TRABALHO</span><div role="group" aria-label="Foco da sala tática"><button type="button" data-tactical-focus="map" aria-pressed="${focus==='map'}">Mapa</button><button type="button" data-tactical-focus="pieces" aria-pressed="${focus==='pieces'}">Peças</button><button type="button" data-tactical-focus="coach" aria-pressed="${focus==='coach'}">Coach View</button></div></div><div class="analysis-focus-scenario-v20"><button type="button" class="btn" data-scenario-nav="prev" ${!previous?'disabled':''}>←</button><div><small>CENÁRIO ${scenarios.length?`${index+1}/${scenarios.length}`:'0/0'}</small><b>${esc(scenario?.name||'Sem cenário')}</b></div><button type="button" class="btn" data-scenario-nav="next" ${!next?'disabled':''}>→</button></div><div class="analysis-focus-kpis-v20"><span><small>CAMPOS DO COACH</small><b>${completion.filled}/${completion.total}</b></span><span><small>TAGS</small><b>${completion.tags}</b></span></div>`;
  qa('[data-tactical-focus]',bar).forEach(button=>button.addEventListener('click',()=>{
    const mode=button.dataset.tacticalFocus||'map';shell.dataset.focusV20=mode;
    const target=mode==='pieces'?q('.tb-left',grid):mode==='coach'?q('.tb-right',grid):q('.tb-center',grid);
    target?.scrollIntoView({behavior:'smooth',block:'start'});tacticalFocus();
  }));
  q('[data-scenario-nav="prev"]',bar)?.addEventListener('click',()=>setScenario(previous?.id));
  q('[data-scenario-nav="next"]',bar)?.addEventListener('click',()=>setScenario(next?.id));
}

function activeVodSession(){const vod=store.state.vod;return vod?.sessions?.find(item=>item.id===vod.activeSessionId)||null;}
function visibleVodCards(root){return qa('.vod-note-card',root).filter(card=>!card.hidden&&getComputedStyle(card).display!=='none');}
function vodFocus(){
  if(route()!=='vod')return;
  const root=q('.vod-pro');const layout=root&&q('.vod-layout',root);const context=root&&q('.vod-analysis-v20',root);
  if(!root||!layout||!context)return;
  let bar=q('.analysis-focus-v20.vod-focus-v20',root);
  if(!bar){bar=document.createElement('section');bar.className='analysis-focus-v20 vod-focus-v20';context.after(bar);root.dataset.vodFocusV20='player';}
  const session=activeVodSession();const cards=visibleVodCards(root);const activeIndex=Math.max(0,cards.findIndex(card=>card.classList.contains('active')));
  const hasActive=cards.some(card=>card.classList.contains('active'));
  const previous=hasActive&&cards.length>1?cards[(activeIndex-1+cards.length)%cards.length]:null;
  const next=cards.length?cards[hasActive?(activeIndex+1)%cards.length:0]:null;
  const focus=root.dataset.vodFocusV20||'player';
  const signature=[session?.id,focus,cards.length,hasActive?activeIndex:-1].join('|');
  if(bar.dataset.signature===signature)return;
  bar.dataset.signature=signature;
  bar.innerHTML=`<div class="analysis-focus-main-v20"><span>FOCO DE REVISÃO</span><div role="group" aria-label="Foco da revisão de VOD"><button type="button" data-vod-focus="player" aria-pressed="${focus==='player'}">Player</button><button type="button" data-vod-focus="annotate" aria-pressed="${focus==='annotate'}">Anotar</button><button type="button" data-vod-focus="timeline" aria-pressed="${focus==='timeline'}">Timeline</button></div></div><div class="analysis-focus-session-v20"><div><small>SESSÃO ATIVA</small><b>${esc(session?.title||'Nenhuma sessão ativa')}</b></div><span>${cards.length} nota(s) visível(is)</span></div><div class="analysis-focus-note-nav-v20"><button type="button" class="btn" data-vod-note-nav="prev" ${!previous?'disabled':''}>← Nota</button><button type="button" class="btn info" data-vod-note-nav="next" ${!next?'disabled':''}>Próxima →</button></div>`;
  qa('[data-vod-focus]',bar).forEach(button=>button.addEventListener('click',()=>{
    const mode=button.dataset.vodFocus||'player';root.dataset.vodFocusV20=mode;
    const target=mode==='timeline'?q('.vod-timeline',layout):mode==='annotate'?q('.vod-note-entry',layout):q('.vod-player-stage',layout);
    target?.scrollIntoView({behavior:'smooth',block:'start'});vodFocus();
  }));
  q('[data-vod-note-nav="prev"]',bar)?.addEventListener('click',()=>q('.vod-note-main',previous)?.click());
  q('[data-vod-note-nav="next"]',bar)?.addEventListener('click',()=>q('.vod-note-main',next)?.click());
}

function apply(){tacticalFocus();vodFocus();}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
window.addEventListener('hashchange',schedule);
window.addEventListener('load',schedule);
schedule();

window.FROMBOS_ANALYSIS_FLOW_V20={apply};
