import { CHAMPIONS, DRAFT_ORDER } from './data.js';
import { store } from './store.js';
import { championAsset } from './champion-intelligence.js';
import { analyzeComposition, scoreCandidate, threatRead, structuralLabel } from './structural-intelligence.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-5);
function draft(){return store.state.draft||{};}
function actions(){return [...(draft().actions||[])].sort((a,b)=>a.step-b.step);}
function picks(side){return actions().filter(a=>a.type==='pick'&&a.side===side).map(a=>a.champ);}
function used(){return new Set(actions().map(a=>a.champ));}
function fearlessBlocked(side='blue'){
  const out=new Set(),d=draft(),mode=d.fearlessMode||(d.fearless?'global':'off');
  if(mode==='off')return out;
  for(let g=1;g<(d.game||1);g++)for(const a of d.games?.[g]?.actions||[]){if(a.type!=='pick')continue;if(mode==='global'||a.side===side)out.add(a.champ);}
  return out;
}
function pool(){return new Set(Object.values(store.state.team?.players||{}).flatMap(p=>p.pool||[]));}
function img(name){const a=championAsset(name);const src=a?.portrait||a?.splash;return src?`<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" referrerpolicy="no-referrer">`:'';}
function featureChips(analysis){const keys=['frontline','engage','peel','waveclear','sustained','objectiveDps','magic','physical'];return keys.map(k=>`<span class="di-feature ${analysis.counts[k]>0?'ok':'debt'}"><i>${analysis.counts[k]>0?'✓':'!'}</i>${esc(structuralLabel(k))}</span>`).join('');}
function nextAction(){const acts=actions();const idx=DRAFT_ORDER.findIndex((_,i)=>!acts.some(a=>a.step===i));return idx<0?null:DRAFT_ORDER[idx];}
function recommendations(own){const next=nextAction();if(!next||next[0]!=='blue'||next[1]!=='pick')return[];const blocked=fearlessBlocked('blue'),seen=used(),teamPool=pool();return CHAMPIONS.filter(c=>!seen.has(c)&&!blocked.has(c)).map(c=>{const base=scoreCandidate(c,own);const poolBonus=teamPool.has(c)?2:0;return{...base,total:base.score+poolBonus,inPool:teamPool.has(c)};}).filter(x=>x.total>0).sort((a,b)=>b.total-a.total||Number(b.inPool)-Number(a.inPool)||a.champion.localeCompare(b.champion)).slice(0,6);}
function futureCost(name){const d=draft(),mode=d.fearlessMode||(d.fearless?'global':'off');if(mode==='off')return'Fearless OFF';if(!pool().has(name))return'Custo futuro baixo no pool local';return mode==='team'?'Consome opção do nosso pool nos próximos jogos':'Consome opção global da série nos próximos jogos';}
function panelHTML(){
  const own=picks('blue'),enemy=picks('red'),ours=analyzeComposition(own),foe=threatRead(enemy),recs=recommendations(own),next=nextAction();
  const recStatus=!next?'Draft concluído':next[0]!=='blue'||next[1]!=='pick'?'Recomendações pausadas até o próximo PICK azul':'cobertura de dívidas + pool local';
  return `<section class="draft-intelligence card" id="draftIntelligence"><div class="di-head"><div><span class="eyebrow">FROMBOS_STRUCTURAL</span><h3>Inteligência de Draft</h3><p class="muted">Leitura heurística do draft. Não é win rate nem dado observado.</p></div><div class="di-actions"><span class="badge gold">${next?`${next[0].toUpperCase()} · ${next[1].toUpperCase()}`:'DRAFT COMPLETO'}</span>${own.length?'<button class="btn info" id="diToTactical">Criar plano tático</button>':''}</div></div>
    <div class="di-grid"><article class="di-block"><div class="di-title"><span>NOSSO DRAFT</span><b>${own.length}/5 picks</b></div><div class="di-features">${featureChips(ours)}</div>${ours.warnings.length?`<div class="di-warnings">${ours.warnings.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<p class="di-ok">Sem alerta estrutural forte neste estágio.</p>'}</article><article class="di-block"><div class="di-title"><span>AMEAÇAS</span><b>${enemy.length}/5 picks</b></div>${foe.threats.length?`<div class="di-threats">${foe.threats.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<p class="di-empty">Ainda não há padrão estrutural forte suficiente.</p>'}<div class="di-mini">${enemy.map(c=>`<span>${img(c)}<b>${esc(c)}</b></span>`).join('')}</div></article></div>
    <div class="di-title di-rec-title"><span>PRÓXIMAS OPÇÕES</span><b>${esc(recStatus)}</b></div><div class="di-recs">${recs.length?recs.map(r=>`<button class="di-rec" data-di-champ="${esc(r.champion)}"><span class="di-rec-img">${img(r.champion)}</span><span class="di-rec-copy"><b>${esc(r.champion)}</b><small>${r.reasons.length?esc(r.reasons.slice(0,2).join(' · ')):'boa cobertura estrutural'}${r.inPool?' · POOL':''}</small><em>${esc(futureCost(r.champion))}</em></span></button>`).join(''):`<div class="di-empty">${esc(recStatus)}</div>`}</div>
    <div class="di-foot"><span>Critério: frontline · engage · peel · waveclear · DPS · objetivo · balanceamento físico/mágico.</span><span>Confiança estrutural: <b>${own.length+enemy.length>=6?'MÉDIA':'BAIXA'}</b></span></div></section>`;
}
function createTacticalPlan(){
  const blue=picks('blue'),red=picks('red');if(!blue.length)return;
  const bluePos=[[145,865],[190,865],[235,865],[145,910],[190,910]],redPos=[[855,135],[810,135],[765,135],[855,90],[810,90]];
  const markers=[...blue.map((label,i)=>({id:uid(),type:'champion',x:bluePos[i][0],y:bluePos[i][1],team:'blue',label})),...red.map((label,i)=>({id:uid(),type:'champion',x:redPos[i][0],y:redPos[i][1],team:'red',label}))];
  const sc={id:uid(),name:`DRAFT G${draft().game||1}`,markers,paths:[],coach:{winCondition:'',strongSide:'',firstObjective:'',avoid:'',tags:[]},layers:{routes:true,zones:true,objectives:true,vision:true,champions:true,notes:true},source:{type:'DRAFT_TRANSFER',game:draft().game||1,createdAt:new Date().toISOString()}};
  store.update(s=>{s.tactical=s.tactical||{};s.tactical.scenarios=Array.isArray(s.tactical.scenarios)?s.tactical.scenarios:[];s.tactical.scenarios.push(sc);s.tactical.activeScenario=sc.id;});
  location.hash='#/tactical';
}
function inject(){if(!location.hash.startsWith('#/draft'))return;const host=document.querySelector('.draft-pro');if(!host)return;const current=document.querySelector('#draftIntelligence');const html=panelHTML();if(current){const tmp=document.createElement('div');tmp.innerHTML=html;current.replaceWith(tmp.firstElementChild);}else{document.querySelector('.champion-select')?.insertAdjacentHTML('beforebegin',html);}document.querySelectorAll('[data-di-champ]').forEach(b=>b.onclick=()=>{const search=document.querySelector('#drSearch');if(search){search.value=b.dataset.diChamp;search.dispatchEvent(new Event('input',{bubbles:true}));search.scrollIntoView({behavior:'smooth',block:'center'});}});document.querySelector('#diToTactical')?.addEventListener('click',createTacticalPlan);}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;inject();});};new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',schedule);schedule();
