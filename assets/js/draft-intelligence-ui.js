import { CHAMPIONS, DRAFT_ORDER } from './data.js';
import { store } from './store.js';
import { championAsset } from './champion-intelligence.js';
import { analyzeComposition, scoreCandidate, threatRead, structuralLabel } from './structural-intelligence.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function draft(){return store.state.draft||{};}
function actions(){return [...(draft().actions||[])].sort((a,b)=>a.step-b.step);}
function picks(side){return actions().filter(a=>a.type==='pick'&&a.side===side).map(a=>a.champ);}
function used(){return new Set(actions().map(a=>a.champ));}
function fearlessBlocked(){const out=new Set();if(!draft().fearless)return out;for(let g=1;g<(draft().game||1);g++)for(const a of draft().games?.[g]?.actions||[])if(a.type==='pick')out.add(a.champ);return out;}
function pool(){return new Set(Object.values(store.state.team?.players||{}).flatMap(p=>p.pool||[]));}
function img(name){const a=championAsset(name);const src=a?.portrait||a?.splash;return src?`<img src="${esc(src)}" alt="${esc(name)}" loading="lazy" referrerpolicy="no-referrer">`:'';}
function featureChips(analysis){
  const keys=['frontline','engage','peel','waveclear','sustained','objectiveDps','magic','physical'];
  return keys.map(k=>`<span class="di-feature ${analysis.counts[k]>0?'ok':'debt'}"><i>${analysis.counts[k]>0?'✓':'!'}</i>${esc(structuralLabel(k))}</span>`).join('');
}
function recommendations(own){
  const blocked=fearlessBlocked(),seen=used(),teamPool=pool();
  return CHAMPIONS.filter(c=>!seen.has(c)&&!blocked.has(c)).map(c=>{const base=scoreCandidate(c,own);const poolBonus=teamPool.has(c)?2:0;return{...base,total:base.score+poolBonus,inPool:teamPool.has(c)};}).filter(x=>x.total>0).sort((a,b)=>b.total-a.total||Number(b.inPool)-Number(a.inPool)||a.champion.localeCompare(b.champion)).slice(0,6);
}
function nextAction(){const acts=actions();const idx=DRAFT_ORDER.findIndex((_,i)=>!acts.some(a=>a.step===i));return idx<0?null:DRAFT_ORDER[idx];}
function futureCost(name){if(!draft().fearless)return 'Fearless OFF';const teamPool=pool();return teamPool.has(name)?'Consome opção do pool nos próximos jogos':'Custo futuro baixo no pool local';}
function panelHTML(){
  const own=picks('blue'),enemy=picks('red'),ours=analyzeComposition(own),foe=threatRead(enemy),recs=recommendations(own),next=nextAction();
  return `<section class="draft-intelligence card" id="draftIntelligence"><div class="di-head"><div><span class="eyebrow">FROMBOS_STRUCTURAL</span><h3>Draft Intelligence</h3><p class="muted">Leitura heurística do draft. Não é win rate nem dado observado.</p></div><span class="badge gold">${next?`${next[0].toUpperCase()} · ${next[1].toUpperCase()}`:'DRAFT COMPLETO'}</span></div>
    <div class="di-grid">
      <article class="di-block"><div class="di-title"><span>NOSSO DRAFT</span><b>${own.length}/5 picks</b></div><div class="di-features">${featureChips(ours)}</div>${ours.warnings.length?`<div class="di-warnings">${ours.warnings.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<p class="di-ok">Sem alerta estrutural forte neste estágio.</p>'}</article>
      <article class="di-block"><div class="di-title"><span>AMEAÇAS</span><b>${enemy.length}/5 picks</b></div>${foe.threats.length?`<div class="di-threats">${foe.threats.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<p class="di-empty">Ainda não há padrão estrutural forte suficiente.</p>'}<div class="di-mini">${enemy.map(c=>`<span>${img(c)}<b>${esc(c)}</b></span>`).join('')}</div></article>
    </div>
    <div class="di-title di-rec-title"><span>PRÓXIMAS OPÇÕES</span><b>cobertura de dívidas + pool local</b></div>
    <div class="di-recs">${recs.length?recs.map(r=>`<button class="di-rec" data-di-champ="${esc(r.champion)}"><span class="di-rec-img">${img(r.champion)}</span><span class="di-rec-copy"><b>${esc(r.champion)}</b><small>${r.reasons.length?esc(r.reasons.slice(0,2).join(' · ')):'boa cobertura estrutural'}${r.inPool?' · POOL':''}</small><em>${esc(futureCost(r.champion))}</em></span></button>`).join(''):'<div class="di-empty">Sem recomendação estrutural forte neste momento.</div>'}</div>
    <div class="di-foot"><span>Critério: frontline · engage · peel · waveclear · DPS · objetivo · balanceamento físico/mágico.</span><span>Confiança: <b>${own.length+enemy.length>=6?'MEDIUM':'LOW'}</b></span></div>
  </section>`;
}
function inject(){
  if(!location.hash.startsWith('#/draft'))return;
  const host=document.querySelector('.draft-pro');if(!host)return;
  const current=document.querySelector('#draftIntelligence');const html=panelHTML();
  if(current){const tmp=document.createElement('div');tmp.innerHTML=html;current.replaceWith(tmp.firstElementChild);}else{const picker=document.querySelector('.champion-select');picker?.insertAdjacentHTML('beforebegin',html);}
  document.querySelectorAll('[data-di-champ]').forEach(b=>b.onclick=()=>{const search=document.querySelector('#drSearch');if(search){search.value=b.dataset.diChamp;search.dispatchEvent(new Event('input',{bubbles:true}));search.scrollIntoView({behavior:'smooth',block:'center'});}});
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;inject();});};
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',schedule);schedule();
