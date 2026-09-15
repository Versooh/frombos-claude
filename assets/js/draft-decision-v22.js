// FROMBOS V22.4 — Draft Decision Layer.
// Reads the active draft DOM, reference composition and FROMBOS structural heuristics only.
// No state mutation and no automatic pick/ban.
import { analyzeComposition, scoreCandidate, threatRead, structuralLabel } from './structural-intelligence.js';
import { portraitHTML } from './champion-intelligence.js';
import { ROLES } from './data.js';
import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function slotNames(selector){return [...document.querySelectorAll(selector)].map(x=>x.textContent.trim()).filter(x=>x&&x!=='—');}
function picks(side){return slotNames(`.draft-team-panel.${side} .dr-slot.pick.filled .dr-slot-copy b`);}
function bans(){return slotNames('.draft-team-panel .dr-slot.ban.filled .dr-slot-copy b');}
function stage(){const text=document.querySelector('.draft-stage-head h2')?.textContent?.trim()||'';return {text,pick:text.includes('ESCOLHA'),side:text.includes('AZUL')?'blue':text.includes('VERMELHO')?'red':null,done:text.includes('CONCLUÍDO')};}
function available(poolOnly=false){return [...document.querySelectorAll(`#drChampGrid .draft-champ-card${poolOnly?'.in-pool':''}:not(.disabled)`)].map(x=>x.dataset.champ).filter(Boolean);}
function tags(keys,kind='neutral'){return keys.length?`<div class="v22-draft-tags">${keys.map(k=>`<span class="${kind}">${esc(structuralLabel(k))}</span>`).join('')}</div>`:'<span class="v22-draft-none">Nenhum sinal forte ainda.</span>';}
function warnings(list){return list.length?`<div class="v22-draft-warnings">${list.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<span class="v22-draft-ok">Sem alerta estrutural neste estágio.</span>';}

function sideCard(side,label,champs){
  const a=analyzeComposition(champs);
  return `<article class="v22-draft-side ${side}"><header><span>${label}</span><b>${champs.length}/5 picks</b></header><div class="v22-draft-picked">${champs.length?champs.map(c=>`<span title="${esc(c)}">${portraitHTML(c,'v22-draft-mini')}</span>`).join(''):'<small>Aguardando picks</small>'}</div><div><small>Forças estruturais</small>${tags(a.strengths,side)}</div><div><small>Alertas</small>${warnings(a.warnings)}</div></article>`;
}

function candidateCards(current,stageInfo){
  if(!stageInfo.pick||!stageInfo.side)return '<div class="v22-draft-phase-note"><b>Fase de banimento</b><span>O FROMBOS não inventa prioridade de ban. Use Scouting/Observed Data para decidir bans.</span></div>';
  const pool=available(true),all=available(false),source=pool.length?pool:all;
  const ranked=source.map(name=>scoreCandidate(name,current)).sort((a,b)=>b.score-a.score||a.champion.localeCompare(b.champion,'pt-BR')).filter(x=>x.score>0).slice(0,5);
  if(!ranked.length)return '<div class="v22-draft-phase-note"><b>Sem recomendação estrutural forte</b><span>Os candidatos disponíveis não cobrem uma dívida clara da composição atual. Isso não significa que sejam picks ruins.</span></div>';
  return `<div class="v22-draft-candidates">${ranked.map((x,i)=>`<button type="button" data-v22-draft-candidate="${esc(x.champion)}"><span class="v22-draft-candidate-art">${portraitHTML(x.champion,'v22-draft-candidate-img')}<i>${String(i+1).padStart(2,'0')}</i></span><strong>${esc(x.champion)}</strong><small>${x.reasons.length?esc(x.reasons.join(' · ')):'fit estrutural'}</small><em>${pool.includes(x.champion)?'PLAYER POOL · USER_PRIVATE':'AVAILABLE · STRUCTURAL'}</em></button>`).join('')}</div>`;
}

function threatPanel(enemy){
  const t=threatRead(enemy);
  return `<article class="v22-draft-threat"><header><span>ENEMY READ</span><b>FROMBOS_STRUCTURAL</b></header>${enemy.length?`<div class="v22-draft-picked">${enemy.map(c=>`<span title="${esc(c)}">${portraitHTML(c,'v22-draft-mini')}</span>`).join('')}</div>`:''}${t.threats.length?`<div class="v22-threat-list">${t.threats.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<p>Ainda não há sinais suficientes para classificar uma ameaça de composição.</p>'}</article>`;
}

function referenceStatus(champion,blue,red,banned,stageInfo){
  if(blue.includes(champion))return'BLUE PICK';
  if(red.includes(champion))return'RED PICK';
  if(banned.includes(champion))return'BANNED';
  if(stageInfo.done)return'UNCLAIMED';
  const card=[...document.querySelectorAll('#drChampGrid [data-champ]')].find(x=>x.dataset.champ===champion);
  if(card?.classList.contains('disabled'))return'BLOCKED';
  return'AVAILABLE';
}
function referencePlan(blue,red,stageInfo){
  const ref=store.state.draft?.referenceComp;if(!ref?.lineup)return'';
  const banned=bans();
  const items=ROLES.map(role=>({role,champion:ref.lineup?.[role.id]||''})).filter(x=>x.champion);
  return `<section class="v22-reference-plan"><header><div><span>REFERENCE COMPOSITION · WORKSPACE</span><b>${esc(ref.name||'Composição de referência')}</b></div><small>${items.length}/5 campeões documentados</small></header><div class="v22-reference-grid">${items.map(({role,champion})=>{const status=referenceStatus(champion,blue,red,banned,stageInfo);const active=status==='AVAILABLE';return `<button type="button" class="v22-reference-item" data-status="${esc(status)}" ${active?`data-v22-reference-champ="${esc(champion)}"`:'disabled'}><div class="v22-reference-art">${portraitHTML(champion,'v22-reference-img')}</div><small>${esc(role.label)}</small><b>${esc(champion)}</b><em>${esc(status)}</em></button>`;}).join('')}</div><p class="v22-reference-note">Estado lido do Draft atual. AVAILABLE apenas localiza o campeão na grade; a confirmação do pick continua manual.</p></section>`;
}

function html(){
  const blue=picks('blue'),red=picks('red'),s=stage();const current=s.side==='red'?red:blue;const enemy=s.side==='red'?blue:red;
  return `<section class="v22-draft-decision v22-reveal">
    <header class="v22-draft-decision-head"><div><span>DRAFT DECISION LAYER</span><h2>Leia a composição enquanto ela nasce.</h2><p>Análise estrutural local: engage, frontline, peel, dano, range, scaling e ameaças. Não é previsão de vitória.</p></div><div class="v22-draft-stage"><small>ESTÁGIO ATUAL</small><b>${esc(s.text||'DRAFT CONCLUÍDO')}</b><span>FROMBOS_STRUCTURAL</span></div></header>
    <div class="v22-draft-read-grid">${sideCard('blue','LADO AZUL',blue)}${sideCard('red','LADO VERMELHO',red)}${threatPanel(enemy)}</div>
    ${referencePlan(blue,red,s)}
    <div class="v22-draft-next"><div class="v22-draft-next-head"><div><span>PRÓXIMA DECISÃO</span><h3>${s.pick?`Candidatos para ${s.side==='blue'?'Azul':'Vermelho'}`:'Ban phase / leitura de scouting'}</h3></div><div class="v22-draft-evidence-row"><span>STRUCTURAL</span><span>${available(true).length?'PLAYER POOL':'AVAILABLE ROSTER'}</span><span>NO WIN PROBABILITY</span></div></div>${candidateCards(current,s)}</div>
    <footer><b>Como usar:</b> clique em um candidato ou campeão AVAILABLE da referência para localizá-lo na grade. A escolha continua manual e o motor de Draft existente permanece responsável por confirmar o pick.</footer>
  </section>`;
}

function focusChampion(name){
  const target=[...document.querySelectorAll('#drChampGrid [data-champ]')].find(x=>x.dataset.champ===name);
  if(!target)return;document.querySelectorAll('.v22-candidate-focus').forEach(x=>x.classList.remove('v22-candidate-focus'));target.classList.add('v22-candidate-focus');target.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>target.classList.remove('v22-candidate-focus'),1800);
}
function bind(root){
  root.querySelectorAll('[data-v22-draft-candidate]').forEach(btn=>btn.addEventListener('click',()=>focusChampion(btn.dataset.v22DraftCandidate)));
  root.querySelectorAll('[data-v22-reference-champ]').forEach(btn=>btn.addEventListener('click',()=>focusChampion(btn.dataset.v22ReferenceChamp)));
}

function apply(){
  if(route()!=='draft')return;
  const draft=document.querySelector('.draft-pro');if(!draft||document.querySelector('.v22-draft-decision'))return;
  const select=draft.querySelector('.champion-select');if(!select)return;
  select.insertAdjacentHTML('beforebegin',html());const root=document.querySelector('.v22-draft-decision');if(root)bind(root);
}

const runtime=window.FROMBOS_V20_RUNTIME;
if(runtime?.subscribe)runtime.subscribe(apply);else window.addEventListener('load',apply);
window.addEventListener('hashchange',()=>queueMicrotask(apply));
queueMicrotask(apply);
window.FROMBOS_V22_DRAFT_DECISION={apply};
