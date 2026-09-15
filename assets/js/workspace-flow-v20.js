// FROMBOS V20.14 — workspace command cockpit for Home, Team and Settings.
// Uses local workspace state only; it does not infer skill, win probability or competitive performance.

import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const go=(label,target,className='btn')=>{const b=document.createElement('button');b.type='button';b.className=className;b.textContent=label;b.onclick=()=>location.hash=`#/${target}`;return b;};
function stat(label,value,note=''){const x=document.createElement('span');x.className='workspace-stat-v20';const b=document.createElement('b');b.textContent=String(value);const s=document.createElement('span');s.textContent=label;x.append(b,s);if(note){const small=document.createElement('small');small.textContent=note;x.appendChild(small);}return x;}
function configuredPositions(){return Object.values(store.state.team?.players||{}).filter(p=>p?.name||(p?.pool||[]).length).length;}
function uniquePool(){return new Set(Object.values(store.state.team?.players||{}).flatMap(p=>p?.pool||[])).size;}
function currentDraftActions(){return store.state.draft?.actions?.length||0;}
function tacticalCount(){return Array.isArray(store.state.tactical?.scenarios)?store.state.tactical.scenarios.length:0;}
function vodSessions(){return store.state.vod?.sessions?.length||0;}
function drills(){return store.state.training?.sessions?.length||0;}

function homeFlow(){
  if(route()!=='home')return;const content=q('.content[data-page="home"]');const hero=content&&q('.hero',content);if(!content||!hero)return;let cockpit=q('.workspace-command-v20',content);
  if(!cockpit){cockpit=document.createElement('section');cockpit.className='workspace-command-v20';cockpit.innerHTML='<div class="workspace-command-head-v20"><span>COACH COMMAND</span><b>Preparação competitiva em um único fluxo</b><small>Contagens abaixo vêm somente do workspace local.</small></div><div class="workspace-stats-v20"></div><div class="workspace-primary-v20"></div><div class="workspace-evidence-v20"><span class="official"><b>OFFICIAL</b> Riot / fonte primária</span><span class="observed"><b>OBSERVED</b> amostra publicada</span><span class="curated"><b>CURATED</b> leitura editorial</span><span class="structural"><b>FROMBOS_STRUCTURAL</b> cálculo estrutural</span></div>';q('.workspace-primary-v20',cockpit).append(go('Meu time','team'),go('Composições','comps'),go('Draft Room','draft','btn primary'),go('Tactical','tactical'),go('VOD Review','vod'),go('Treinos','training','btn info'));hero.after(cockpit);}
  const stats=q('.workspace-stats-v20',cockpit);if(stats)stats.replaceChildren(stat('posições configuradas',`${configuredPositions()}/5`,'roster/pools'),stat('campeões únicos',uniquePool(),'pool local'),stat('draft atual',`${currentDraftActions()}/20`,'ações registradas'),stat('cenários táticos',tacticalCount(),'workspace local'),stat('sessões VOD',vodSessions(),'arquivos não enviados'),stat('drills',drills(),'Coach Mode'));
}
function teamFlow(){
  if(route()!=='team')return;const content=q('.content[data-page="team"]');const card=content&&q(':scope>.card',content);if(!content||!card)return;let flow=q('.team-pipeline-v20',content);
  if(!flow){flow=document.createElement('section');flow.className='team-pipeline-v20';flow.innerHTML='<div><span>TEAM PIPELINE</span><b>Roster → Pools → Composições → Draft → Treino</b><small>Champion pool é contexto local; não representa proficiência automaticamente.</small></div><div class="team-pipeline-links-v20"></div>';q('.team-pipeline-links-v20',flow).append(go('Composições','comps'),go('Draft','draft','btn info'),go('Reports','reports'));card.before(flow);}
  const title=q('b',flow);if(title)title.textContent=`${configuredPositions()}/5 posições · ${uniquePool()} campeões únicos no pool`;
}
function settingsFlow(){
  if(route()!=='settings')return;const content=q('.content[data-page="settings"]');const grid=content&&q(':scope>.grid.cols-2',content);if(!content||!grid)return;let guard=q('.settings-guard-v20',content);
  if(!guard){guard=document.createElement('section');guard.className='settings-guard-v20';guard.innerHTML='<div><span>WORKSPACE SAFETY</span><b>Dados operacionais permanecem no workspace local</b><small>Backup/exportação é a forma segura de transportar o estado entre dispositivos.</small></div><div class="settings-guard-tags-v20"><span>WILD RIFT ONLY</span><span>UNKNOWN PRESERVADO</span><span>SEM MÉTRICA INVENTADA</span></div><div class="settings-guard-links-v20"></div>';q('.settings-guard-links-v20',guard).append(go('Data Center','data','btn info'),go('Relatórios','reports'));grid.before(guard);}
}
function apply(){homeFlow();teamFlow();settingsFlow();}
function bindRuntime(){
  const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe){runtime.subscribe(apply);return;}
  let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});};new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();
}
bindRuntime();
window.FROMBOS_WORKSPACE_FLOW_V20={apply};
