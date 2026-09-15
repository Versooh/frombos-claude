import { store } from './store.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fmt=s=>`${String(Math.floor((s||0)/60)).padStart(2,'0')}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;
const ROLE_LABEL={BARON:'Barão',JUNGLE:'Selva',MID:'Meio',DUO:'Duo',SUPPORT:'Suporte',TEAM:'Equipe / Geral'};
const DRILL_STATUS={PENDING:'Pendente',ACTIVE:'Em treino',DONE:'Concluído'};
const stages=[
  {id:'t60',label:'T-60',title:'Ler o mapa',items:['Definir se o objetivo importa','Checar waves laterais e mid','Localizar último reveal do jungle inimigo','Checar gold/vida/mana e necessidade de reset']},
  {id:'t45',label:'T-45',title:'Criar tempo',items:['Resetar quem precisa comprar','Encerrar pathing longo do jungle','Preparar side wave para pressionar junto','Definir quem chega primeiro ao rio']},
  {id:'t30',label:'T-30',title:'Tomar espaço',items:['Garantir prioridade de mid se possível','Entrar com números','Wardear entradas relevantes','Remover visão inimiga e identificar flank']},
  {id:'t15',label:'T-15',title:'Fazer a call',items:['Definir START / BAIT / TURN / GIVE / TRADE','Confirmar engage/peel disponível','Posicionar carry fora do face-check','Definir plano de saída/conversão']}
];
const visionRules=[
  {tag:'TRACK',title:'Rastrear',text:'Visão para responder por onde o jungle ou uma rotação pode entrar.'},
  {tag:'OBJECTIVE',title:'Objetivo',text:'Controlar aproximações e informação antes de iniciar, baitar ou virar.'},
  {tag:'FLANK',title:'Flank',text:'Negar ângulo lateral/traseiro sobre backline ou carry.'},
  {tag:'SIDE',title:'Side lane',text:'Dar permissão para avançar a lateral sem jogar no escuro.'},
  {tag:'PICK',title:'Pick',text:'Criar escuridão e informação assimétrica para captura.'},
  {tag:'DEFEND',title:'Defender',text:'Proteger entradas quando o time está sem prioridade ou recuado.'}
];
function ensure(){
  let changed=false;const s=store.state;
  if(!s.training||typeof s.training!=='object'){s.training={};changed=true;}
  if(!Array.isArray(s.training.sessions)){s.training.sessions=[];changed=true;}
  if(!Array.isArray(s.training.focus)){s.training.focus=['Macro','Visão','Objetivos'];changed=true;}
  if(!s.training.coach){s.training.coach={objective:'Dragon',call:'',checks:{},notes:'',visionPurpose:'OBJECTIVE'};changed=true;}
  if(changed)store.save();
}
function coach(){return store.state.training.coach;}
function progress(){const c=coach(),all=stages.flatMap(s=>s.items.map((_,i)=>`${s.id}-${i}`));const done=all.filter(k=>c.checks?.[k]).length;return {done,total:all.length,pct:Math.round(done/all.length*100)};}
function playerLabel(value){if(!value||value==='TEAM')return'Equipe / Geral';const p=store.state.team?.players?.[value];return`${ROLE_LABEL[value]||value}${p?.name?` · ${p.name}`:''}`;}
function vodSession(id){return(store.state.vod?.sessions||[]).find(x=>x.id===id)||null;}
function vodNote(id){return(store.state.vod?.reviews||[]).find(x=>x.id===id)||null;}
function vodDrills(){return(store.state.training?.sessions||[]).filter(x=>x.type==='VOD_CORRECTION_DRILL');}
function drillForNote(noteId){return vodDrills().find(x=>x.source?.type==='VOD_NOTE'&&x.source?.noteId===noteId)||null;}
function vodInbox(){return[...(store.state.vod?.reviews||[])].filter(n=>!drillForNote(n.id)).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));}
function vodSummary(){const notes=store.state.vod?.reviews||[];const counts={};for(const n of notes){const k=n.category||'Sem categoria';counts[k]=(counts[k]||0)+1;}return Object.entries(counts).sort((a,b)=>b[1]-a[1]);}
function createVodDrill(noteId){
  const note=vodNote(noteId);if(!note)return null;const existing=drillForNote(noteId);if(existing)return existing;const sourceSession=vodSession(note.sessionId);
  const drill={id:uid(),type:'VOD_CORRECTION_DRILL',title:`${note.category||'VOD'} · ${playerLabel(note.player)} · ${fmt(note.time)}`,status:'PENDING',plan:'Reproduzir a situação, definir a decisão correta e repetir a execução em contexto equivalente.',successCriteria:'Executar a decisão correta em situação equivalente e confirmar a correção no próximo VOD.',repetitions:3,source:{type:'VOD_NOTE',sessionId:note.sessionId,noteId:note.id},createdAt:new Date().toISOString(),sourceTitle:sourceSession?.title||'Revisão de VOD'};
  store.update(s=>s.training.sessions.push(drill));return drill;
}
function evidenceHTML(note){const session=vodSession(note.sessionId);return`<article class="vod-training-evidence"><div class="vod-training-evidence-media">${note.snapshot?`<img src="${note.snapshot}" alt="Evidência VOD ${fmt(note.time)}">`:'<span>SEM IMAGEM</span>'}</div><div class="vod-training-evidence-copy"><div class="vod-training-meta"><b>${fmt(note.time)}</b><span>${esc(note.category||'Nota')}</span><em>${esc(playerLabel(note.player))}</em></div><strong>${esc(session?.title||'Revisão de VOD')}</strong><p>${esc(note.note||'Quadro tático')}</p><div class="top-actions"><button class="btn primary" data-vod-create-drill="${esc(note.id)}">Criar drill</button><button class="btn" data-vod-evidence="${esc(note.id)}">Abrir evidência</button></div></div></article>`;}
function drillHTML(drill){const note=vodNote(drill.source?.noteId),session=vodSession(drill.source?.sessionId);return`<article class="vod-training-drill ${String(drill.status||'PENDING').toLowerCase()}"><div class="vod-training-drill-head"><div><span class="eyebrow">VOD CORRECTION DRILL</span><h4>${esc(drill.title||'Drill de VOD')}</h4></div><select class="select" data-vod-drill-status="${esc(drill.id)}">${Object.entries(DRILL_STATUS).map(([v,l])=>`<option value="${v}" ${v===(drill.status||'PENDING')?'selected':''}>${l}</option>`).join('')}</select></div><div class="vod-training-source"><span>${note?fmt(note.time):'--:--'}</span><b>${esc(note?.category||'Evidência indisponível')}</b><em>${esc(note?playerLabel(note.player):'Fonte removida')}</em></div>${note?.snapshot?`<img class="vod-training-thumb" src="${note.snapshot}" alt="Evidência vinculada">`:''}<label>Plano<textarea class="textarea" data-vod-drill-plan="${esc(drill.id)}">${esc(drill.plan||'')}</textarea></label><label>Critério de sucesso<textarea class="textarea" data-vod-drill-success="${esc(drill.id)}">${esc(drill.successCriteria||'')}</textarea></label><div class="vod-training-drill-foot"><span>Fonte: ${esc(session?.title||drill.sourceTitle||'VOD')}</span><div class="top-actions">${note?`<button class="btn" data-vod-evidence="${esc(note.id)}">Reabrir VOD</button>`:''}<button class="btn danger-outline" data-vod-drill-delete="${esc(drill.id)}">Remover</button></div></div></article>`;}
export function performanceCenterHTML(){
  ensure();const c=coach(),p=progress(),vod=vodSummary(),inbox=vodInbox(),drills=vodDrills();const done=drills.filter(x=>x.status==='DONE').length,active=drills.filter(x=>x.status==='ACTIVE').length;
  return `<div class="performance-center">
  <section class="performance-hero card"><div><span class="eyebrow">COACH MODE · V15</span><h2>Treinar a decisão antes da execução</h2><p>O fluxo do FROMBOS é: informação → wave → tempo → visão → números → objetivo → execução → conversão → revisão → correção.</p></div><div class="coach-score"><b>${p.pct}%</b><span>setup atual</span></div></section>
  <div class="performance-kpis"><div><small>EVIDÊNCIAS VOD</small><b>${store.state.vod?.reviews?.length||0}</b></div><div><small>AGUARDANDO DRILL</small><b>${inbox.length}</b></div><div><small>EM TREINO</small><b>${active}</b></div><div><small>CONCLUÍDOS</small><b>${done}</b></div></div>
  <div class="performance-grid">
    <section class="card objective-trainer"><div class="section-title"><div><span class="eyebrow">OBJECTIVE SETUP TRAINER</span><h3>Preparação T-60 → T-0</h3></div><select class="select" id="coachObjective"><option ${c.objective==='Dragon'?'selected':''}>Dragon</option><option ${c.objective==='Herald'?'selected':''}>Herald</option><option ${c.objective==='Baron'?'selected':''}>Baron</option><option ${c.objective==='Elder'?'selected':''}>Elder</option></select></div><div class="objective-timeline">${stages.map(s=>`<article class="coach-stage"><div class="coach-stage-time">${s.label}</div><h4>${s.title}</h4>${s.items.map((x,i)=>{const key=`${s.id}-${i}`;return `<label class="coach-check"><input type="checkbox" data-coach-check="${key}" ${c.checks?.[key]?'checked':''}><span>${esc(x)}</span></label>`}).join('')}</article>`).join('')}</div><div class="coach-call"><span class="eyebrow">CALL</span><div class="coach-call-buttons">${['START','BAIT','TURN','GIVE','TRADE'].map(x=>`<button class="btn ${c.call===x?'active':''}" data-coach-call="${x}">${x}</button>`).join('')}</div><textarea id="coachNotes" class="textarea" placeholder="Por que esta call é correta neste estado?">${esc(c.notes||'')}</textarea><div class="top-actions"><button class="btn primary" id="coachSaveSession">Salvar drill</button><button class="btn" id="coachResetSetup">Resetar setup</button></div></div></section>
    <aside class="card vision-trainer"><span class="eyebrow">VISION TRAINER</span><h3>Ward com propósito</h3><p class="muted">Escolha a pergunta que sua visão precisa responder; depois desenhe a execução no Tactical Board.</p><div class="vision-purpose-grid">${visionRules.map(v=>`<button class="vision-purpose ${c.visionPurpose===v.tag?'active':''}" data-vision-purpose="${v.tag}"><b>${v.title}</b><span>${v.text}</span><small>${v.tag}</small></button>`).join('')}</div><button class="btn info" id="coachOpenTactical">Abrir Tactical Board →</button></aside>
  </div>
  <section class="card performance-vod-bridge"><div class="section-title"><div><span class="eyebrow">VOD → TREINO</span><h3>Evidência vira plano de correção</h3><p class="muted">O drill referencia a anotação original. Timestamp e screenshot permanecem no VOD Review.</p></div><button class="btn" data-go-vod>Revisar VOD</button></div><div class="performance-vod-columns"><div><div class="performance-subhead"><b>Caixa de entrada</b><span>${inbox.length} pendente(s)</span></div><div class="vod-training-inbox">${inbox.length?inbox.slice(0,8).map(evidenceHTML).join(''):'<div class="empty">Todas as evidências atuais já foram convertidas em drills.</div>'}</div></div><div><div class="performance-subhead"><b>Plano de correção</b><span>${drills.length} drill(s)</span></div><div class="vod-training-drills">${drills.length?drills.slice().reverse().map(drillHTML).join(''):'<div class="empty">Crie um drill a partir de uma anotação do VOD.</div>'}</div></div></div></section>
  <div class="performance-grid lower">
    <section class="card"><div class="section-title"><div><span class="eyebrow">PADRÕES DE VOD</span><h3>Categorias recorrentes</h3></div><span class="badge blue">${store.state.vod?.reviews?.length||0} notas</span></div>${vod.length?`<div class="vod-patterns">${vod.map(([k,n])=>`<div><b>${esc(k)}</b><span>${n}</span></div>`).join('')}</div>`:'<div class="empty">Anote VODs por categoria para transformar padrões em treino.</div>'}</section>
    <section class="card"><span class="eyebrow">COACH RULES</span><h3>Regras de execução</h3><div class="coach-rule-list"><div><b>01</b><p>Não avaliar somente a luta final; voltar 30–60s para procurar a decisão que criou a posição.</p></div><div><b>02</b><p>Rotação boa exige wave resolvida, caminho aceitável e recompensa clara.</p></div><div><b>03</b><p>Ward precisa responder uma pergunta do próximo plano.</p></div><div><b>04</b><p>Jungle planeja sequência curta: ação atual + próximos dois movimentos.</p></div><div><b>05</b><p>Depois da vantagem, converter e sair — não devolver shutdown por excesso.</p></div></div></section>
  </div>
</div>`;
}
export function bindPerformanceCenter(rerender){
  document.querySelector('#coachObjective')?.addEventListener('change',e=>store.update(s=>s.training.coach.objective=e.target.value));
  document.querySelectorAll('[data-coach-check]').forEach(i=>i.onchange=()=>{store.update(s=>s.training.coach.checks[i.dataset.coachCheck]=i.checked);rerender();});
  document.querySelectorAll('[data-coach-call]').forEach(b=>b.onclick=()=>{store.update(s=>s.training.coach.call=b.dataset.coachCall);rerender();});
  document.querySelectorAll('[data-vision-purpose]').forEach(b=>b.onclick=()=>{store.update(s=>s.training.coach.visionPurpose=b.dataset.visionPurpose);rerender();});
  document.querySelector('#coachNotes')?.addEventListener('change',e=>store.update(s=>s.training.coach.notes=e.target.value));
  document.querySelector('#coachSaveSession')?.addEventListener('click',()=>{const c=structuredClone(store.state.training.coach);store.update(s=>s.training.sessions.push({id:uid(),type:'OBJECTIVE_SETUP_DRILL',objective:c.objective,call:c.call,checks:c.checks,notes:c.notes,visionPurpose:c.visionPurpose,createdAt:new Date().toISOString()}));alert('Drill salvo no workspace.');});
  document.querySelector('#coachResetSetup')?.addEventListener('click',()=>{store.update(s=>s.training.coach={objective:s.training.coach.objective||'Dragon',call:'',checks:{},notes:'',visionPurpose:'OBJECTIVE'});rerender();});
  document.querySelector('#coachOpenTactical')?.addEventListener('click',()=>location.hash='#/tactical');
  document.querySelectorAll('[data-go-vod]').forEach(b=>b.onclick=()=>location.hash='#/vod');
  document.querySelectorAll('[data-vod-create-drill]').forEach(b=>b.onclick=()=>{createVodDrill(b.dataset.vodCreateDrill);rerender();});
  document.querySelectorAll('[data-vod-evidence]').forEach(b=>b.onclick=()=>{const note=vodNote(b.dataset.vodEvidence);if(!note)return;store.update(s=>{s.vod.activeSessionId=note.sessionId;s.vod.focusNoteId=note.id;});location.hash='#/vod';});
  document.querySelectorAll('[data-vod-drill-status]').forEach(sel=>sel.onchange=()=>{store.update(s=>{const d=s.training.sessions.find(x=>x.id===sel.dataset.vodDrillStatus);if(d){d.status=sel.value;d.updatedAt=new Date().toISOString();}});rerender();});
  document.querySelectorAll('[data-vod-drill-plan]').forEach(el=>el.onchange=()=>store.update(s=>{const d=s.training.sessions.find(x=>x.id===el.dataset.vodDrillPlan);if(d){d.plan=el.value;d.updatedAt=new Date().toISOString();}}));
  document.querySelectorAll('[data-vod-drill-success]').forEach(el=>el.onchange=()=>store.update(s=>{const d=s.training.sessions.find(x=>x.id===el.dataset.vodDrillSuccess);if(d){d.successCriteria=el.value;d.updatedAt=new Date().toISOString();}}));
  document.querySelectorAll('[data-vod-drill-delete]').forEach(b=>b.onclick=()=>{if(!confirm('Remover este drill? A anotação original do VOD será preservada.'))return;store.update(s=>s.training.sessions=s.training.sessions.filter(x=>x.id!==b.dataset.vodDrillDelete));rerender();});
}
