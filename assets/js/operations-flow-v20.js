// FROMBOS V20.13 — operational flow across Training, Scouting, Reports and Match Center.
// Reads existing workspace/DOM state only. No competitive metric is inferred or reclassified here.

import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const setText=(el,value)=>{if(el&&el.textContent!==String(value))el.textContent=String(value);};

function go(label,target,className='btn'){
  const button=document.createElement('button');
  button.type='button';button.className=className;button.textContent=label;
  button.onclick=()=>location.hash=`#/${target}`;
  return button;
}
function metric(label,value,note=''){
  const item=document.createElement('span');item.className='ops-metric-v20';
  const b=document.createElement('b');b.textContent=String(value);
  const copy=document.createElement('span');copy.textContent=label;
  item.append(b,copy);
  if(note){const small=document.createElement('small');small.textContent=note;item.appendChild(small);}
  return item;
}
function makeBar(className,kicker,title){
  const bar=document.createElement('section');bar.className=`ops-flow-v20 ${className}`;
  bar.innerHTML='<div class="ops-flow-head-v20"><span class="ops-kicker-v20"></span><b class="ops-title-v20"></b></div><div class="ops-metrics-v20"></div><div class="ops-links-v20"></div>';
  setText(q('.ops-kicker-v20',bar),kicker);setText(q('.ops-title-v20',bar),title);
  return bar;
}
function vodDrillState(){
  const notes=store.state.vod?.reviews||[];
  const drills=store.state.training?.sessions||[];
  const vodDrills=drills.filter(x=>x.type==='VOD_CORRECTION_DRILL');
  const linked=new Set(vodDrills.map(x=>x.source?.noteId).filter(Boolean));
  return {
    notes:notes.length,
    pending:notes.filter(x=>!linked.has(x.id)).length,
    active:vodDrills.filter(x=>x.status==='ACTIVE').length,
    done:vodDrills.filter(x=>x.status==='DONE').length
  };
}

function trainingFlow(){
  if(route()!=='training')return;
  const root=q('.performance-center');const hero=root&&q('.performance-hero',root);if(!root||!hero)return;
  let bar=q('.training-ops-flow-v20',root);
  if(!bar){
    bar=makeBar('training-ops-flow-v20','TRAINING LOOP','Da evidência à correção');
    hero.after(bar);
    const links=q('.ops-links-v20',bar);links.append(go('Tactical Board','tactical','btn info'),go('VOD Review','vod'),go('Relatórios','reports'));
  }
  const metrics=q('.ops-metrics-v20',bar);if(!metrics)return;
  const checks=qa('[data-coach-check]',root);const doneChecks=checks.filter(x=>x.checked).length;const vod=vodDrillState();
  metrics.replaceChildren(
    metric('setup atual',`${doneChecks}/${checks.length||0}`,'checklist local'),
    metric('evidências VOD',vod.notes,'timestamps locais'),
    metric('aguardando drill',vod.pending,'ainda sem correção'),
    metric('drills ativos',vod.active,'status local'),
    metric('concluídos',vod.done,'status local')
  );
}

function scoutingFlow(){
  if(route()!=='scouting')return;
  const root=q('.scouting-war-room');const command=root&&q('.scout-command',root);if(!root||!command)return;
  let bar=q('.scouting-ops-flow-v20',root);
  if(!bar){
    bar=makeBar('scouting-ops-flow-v20','EVIDENCE ROUTING','Scouting → preparação de série');
    command.after(bar);
    const links=q('.ops-links-v20',bar);links.append(go('Abrir Draft','draft','btn info'),go('Fearless / Série','series'),go('Data Center','data'));
  }
  const team=store.state.scouting?.selectedTeam||store.state.team?.opponent||'Adversário não selecionado';
  setText(q('.ops-title-v20',bar),team);
  const registryPlayers=qa('.sc-reg-player',root).length;
  const lineup=qa('.sc-lineup-list > span',root).length;
  const localPlayers=qa('.scout-player-list article',root).length;
  const unknowns=qa('.unknown-list > div',root).length;
  const metrics=q('.ops-metrics-v20',bar);if(!metrics)return;
  metrics.replaceChildren(
    metric('lineup observada',lineup,'registros materializados'),
    metric('ranking observado',registryPlayers,'jogadores no snapshot'),
    metric('leitura local',localPlayers,'cards do war room'),
    metric('UNKNOWN',unknowns,'lacunas preservadas')
  );
}

function reportsFlow(){
  if(route()!=='reports')return;
  const root=q('.reports-center');const hero=root&&q('.report-hero',root);if(!root||!hero)return;
  let bar=q('.reports-ops-flow-v20',root);
  if(!bar){
    bar=makeBar('reports-ops-flow-v20','OPERATING QUEUE','O que ainda precisa de revisão');
    hero.after(bar);
    const links=q('.ops-links-v20',bar);links.append(go('Match Center','matches','btn info'),go('Draft','draft'),go('VOD','vod'),go('Treinos','training'));
  }
  const games=Object.values(store.state.draft?.games||{}).filter(g=>(g.actions||[]).length);
  const incompleteDrafts=games.filter(g=>(g.actions||[]).length<20).length;
  const matches=store.state.matches?.games||[];
  const unknownResults=matches.filter(x=>!x.result||x.result==='UNKNOWN').length;
  const withoutVod=matches.filter(x=>!x.vodSessionId).length;
  const vod=vodDrillState();
  const metrics=q('.ops-metrics-v20',bar);if(!metrics)return;
  metrics.replaceChildren(
    metric('drafts incompletos',incompleteDrafts,'estado local'),
    metric('resultado UNKNOWN',unknownResults,'Match Center'),
    metric('jogos sem VOD',withoutVod,'vínculo ausente'),
    metric('VOD sem drill',vod.pending,'fila de correção')
  );
}

function matchFlow(){
  if(route()!=='matches')return;
  const root=q('.match-center-v18');const hero=root&&q('.mc-hero',root);if(!root||!hero)return;
  let bar=q('.matches-ops-flow-v20',root);
  if(!bar){
    bar=makeBar('matches-ops-flow-v20','MATCH CONTEXT','Registro → evidência → revisão');
    hero.after(bar);
    const links=q('.ops-links-v20',bar);links.append(go('Draft Room','draft','btn info'),go('VOD Review','vod'),go('Relatórios','reports'));
  }
  const rows=store.state.matches?.games||[];
  const draftLinked=rows.filter(x=>x.draftSnapshot||x.draftGame).length;
  const vodLinked=rows.filter(x=>x.vodSessionId).length;
  const unknown=rows.filter(x=>!x.result||x.result==='UNKNOWN').length;
  const metrics=q('.ops-metrics-v20',bar);if(!metrics)return;
  metrics.replaceChildren(
    metric('registros',rows.length,'workspace local'),
    metric('com Draft',draftLinked,'snapshot/vínculo'),
    metric('com VOD',vodLinked,'sessão vinculada'),
    metric('resultado UNKNOWN',unknown,'não inferido')
  );
}

function apply(){trainingFlow();scoutingFlow();reportsFlow();matchFlow();}
let pending=false;
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();

window.FROMBOS_OPERATIONS_FLOW_V20={apply};
