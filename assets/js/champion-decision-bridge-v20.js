// FROMBOS V20.21 — Champion Decision Bridge.
// Connects Champion Intelligence -> Matchup -> Build -> Compositions -> Draft using
// only materialized/local workspace state. No competitive score or evidence is inferred here.

import { CHAMPIONS, RECOVERED_COMPOSITIONS, ROLES } from './data.js';
import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params=()=>new URLSearchParams(location.hash.split('?')[1]||'');
const selectedChampion=()=>{const wanted=params().get('champion');return CHAMPIONS.includes(wanted)?wanted:CHAMPIONS[0]||'';};
const customComps=()=>Array.isArray(store.state.customComps)?store.state.customComps:[];
const allComps=()=>[...RECOVERED_COMPOSITIONS,...customComps()];

function poolRoles(name){
  return ROLES.filter(role=>(store.state.team?.players?.[role.id]?.pool||[]).includes(name));
}
function compsWith(name){return allComps().filter(comp=>ROLES.some(role=>comp.lineup?.[role.id]===name));}
function draftUsage(name){
  const current=store.state.draft?.actions||[];
  return current.filter(action=>action?.champ===name).length;
}
function bridgeTarget(target,name){
  if(target==='matchups'||target==='builds'||target==='comps'||target==='draft') location.hash=`#/${target}?champion=${encodeURIComponent(name)}`;
}
function ensureChampionBridge(){
  if(route()!=='champions')return;
  const detail=q('.content[data-page="champions"] .ci-detail');if(!detail)return;
  const name=selectedChampion();const roles=poolRoles(name);const comps=compsWith(name);const privateCount=comps.filter(comp=>comp.origin==='USER_PRIVATE').length;const usage=draftUsage(name);
  let bridge=q('.champ-decision-bridge-v20',detail);
  if(!bridge){bridge=document.createElement('section');bridge.className='champ-decision-bridge-v20';const anchor=q('.ci-flow-v20',detail)||q('.ci-evidence-strip',detail);anchor?.after(bridge);}
  const signature=[name,roles.map(r=>r.id).join(','),comps.length,privateCount,usage].join('|');if(bridge.dataset.signature===signature)return;bridge.dataset.signature=signature;
  bridge.innerHTML=`<div class="champ-bridge-head-v20"><div><span>DECISION BRIDGE · ${esc(name)}</span><b>Da leitura do campeão para a decisão de draft</b><small>Somente estado local/materializado. Nenhuma taxa ou score é criado.</small></div><span class="champ-bridge-proof-v20">EVIDENCE SAFE</span></div><div class="champ-bridge-kpis-v20"><span><small>POOL DO TIME</small><b>${roles.length?roles.map(role=>esc(role.label)).join(' · '):'NÃO CONFIGURADO'}</b></span><span><small>COMPOSIÇÕES</small><b>${comps.length}</b><em>${privateCount} USER_PRIVATE</em></span><span><small>DRAFT ATUAL</small><b>${usage}</b><em>${usage===1?'ação registrada':'ações registradas'}</em></span></div><div class="champ-bridge-actions-v20"><button type="button" class="btn" data-champ-bridge="matchups">Matchup Lab</button><button type="button" class="btn" data-champ-bridge="builds">Build Intelligence</button><button type="button" class="btn info" data-champ-bridge="comps">Composições com ${esc(name)}</button><button type="button" class="btn primary" data-champ-bridge="draft">Localizar no Draft</button></div>`;
  qa('[data-champ-bridge]',bridge).forEach(button=>button.addEventListener('click',()=>bridgeTarget(button.dataset.champBridge,name)));
}
function ensureContextBanner(page,name,label){
  const content=q(`.content[data-page="${page}"]`);if(!content)return null;
  let bar=q('.champ-route-context-v20',content);if(!bar){bar=document.createElement('section');bar.className='champ-route-context-v20';const head=q('.page-head',content);head?.after(bar);}
  if(!bar)return null;
  bar.innerHTML=`<div><span>CHAMPION CONTEXT</span><b>${esc(name)}</b><small>${esc(label)}</small></div><button type="button" class="btn" data-champ-context-clear-v20>Limpar contexto</button>`;
  q('[data-champ-context-clear-v20]',bar)?.addEventListener('click',()=>{location.hash=`#/${page}`;});
  return bar;
}
function applyCompositionContext(){
  if(route()!=='comps')return;const name=params().get('champion');if(!CHAMPIONS.includes(name))return;
  const search=q('#compSearchV20');if(!search)return;ensureContextBanner('comps',name,'Filtro aplicado às composições renderizadas; nenhuma evidência é alterada.');
  if(search.dataset.champBridgeApplied===name)return;search.dataset.champBridgeApplied=name;search.value=name;search.dispatchEvent(new Event('input',{bubbles:true}));
}
function applyDraftContext(){
  if(route()!=='draft')return;const name=params().get('champion');if(!CHAMPIONS.includes(name))return;
  const search=q('#drSearch');if(!search)return;ensureContextBanner('draft',name,'Apenas localiza o campeão no seletor. Nenhum pick ou ban é executado automaticamente.');
  if(search.dataset.champBridgeApplied===name)return;search.dataset.champBridgeApplied=name;search.value=name;search.dispatchEvent(new Event('input',{bubbles:true}));search.focus({preventScroll:true});
}
function apply(){ensureChampionBridge();applyCompositionContext();applyDraftContext();}
function bindRuntime(){const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe){runtime.subscribe(apply);return;}let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});};new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();}
bindRuntime();
window.FROMBOS_CHAMPION_DECISION_BRIDGE_V20={apply};
