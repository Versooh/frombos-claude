import { store } from './store.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
function ensure(){store.update(s=>{s.training=s.training||{};s.training.sessions=Array.isArray(s.training.sessions)?s.training.sessions:[];s.training.focus=Array.isArray(s.training.focus)?s.training.focus:['Macro','Visão','Objetivos'];s.training.coach=s.training.coach||{objective:'Dragon',call:'',checks:{},notes:'',visionPurpose:'OBJECTIVE'};});}
function coach(){return store.state.training.coach;}
function progress(){const c=coach(),all=stages.flatMap(s=>s.items.map((_,i)=>`${s.id}-${i}`));const done=all.filter(k=>c.checks?.[k]).length;return {done,total:all.length,pct:Math.round(done/all.length*100)};}
function vodSummary(){const notes=store.state.vod?.reviews||[];const counts={};for(const n of notes){const k=n.category||'Sem categoria';counts[k]=(counts[k]||0)+1;}return Object.entries(counts).sort((a,b)=>b[1]-a[1]);}
export function performanceCenterHTML(){ensure();const c=coach(),p=progress(),vod=vodSummary();return `<div class="performance-center">
  <section class="performance-hero card"><div><span class="eyebrow">COACH MODE</span><h2>Treinar a decisão antes da execução</h2><p>O fluxo do FROMBOS é: informação → wave → tempo → visão → números → objetivo → execução → conversão.</p></div><div class="coach-score"><b>${p.pct}%</b><span>setup atual</span></div></section>
  <div class="performance-grid">
    <section class="card objective-trainer"><div class="section-title"><div><span class="eyebrow">OBJECTIVE SETUP TRAINER</span><h3>Preparação T-60 → T-0</h3></div><select class="select" id="coachObjective"><option ${c.objective==='Dragon'?'selected':''}>Dragon</option><option ${c.objective==='Herald'?'selected':''}>Herald</option><option ${c.objective==='Baron'?'selected':''}>Baron</option><option ${c.objective==='Elder'?'selected':''}>Elder</option></select></div><div class="objective-timeline">${stages.map(s=>`<article class="coach-stage"><div class="coach-stage-time">${s.label}</div><h4>${s.title}</h4>${s.items.map((x,i)=>{const key=`${s.id}-${i}`;return `<label class="coach-check"><input type="checkbox" data-coach-check="${key}" ${c.checks?.[key]?'checked':''}><span>${esc(x)}</span></label>`}).join('')}</article>`).join('')}</div><div class="coach-call"><span class="eyebrow">CALL</span><div class="coach-call-buttons">${['START','BAIT','TURN','GIVE','TRADE'].map(x=>`<button class="btn ${c.call===x?'active':''}" data-coach-call="${x}">${x}</button>`).join('')}</div><textarea id="coachNotes" class="textarea" placeholder="Por que esta call é correta neste estado?">${esc(c.notes||'')}</textarea><div class="top-actions"><button class="btn primary" id="coachSaveSession">Salvar drill</button><button class="btn" id="coachResetSetup">Resetar setup</button></div></div></section>
    <aside class="card vision-trainer"><span class="eyebrow">VISION TRAINER</span><h3>Ward com propósito</h3><p class="muted">Escolha a pergunta que sua visão precisa responder; depois desenhe a execução no Tactical Board.</p><div class="vision-purpose-grid">${visionRules.map(v=>`<button class="vision-purpose ${c.visionPurpose===v.tag?'active':''}" data-vision-purpose="${v.tag}"><b>${v.title}</b><span>${v.text}</span><small>${v.tag}</small></button>`).join('')}</div><button class="btn info" id="coachOpenTactical">Abrir Tactical Board →</button></aside>
  </div>
  <div class="performance-grid lower">
    <section class="card"><div class="section-title"><div><span class="eyebrow">VOD → TREINO</span><h3>Padrões encontrados</h3></div><span class="badge blue">${store.state.vod?.reviews?.length||0} notas</span></div>${vod.length?`<div class="vod-patterns">${vod.map(([k,n])=>`<div><b>${esc(k)}</b><span>${n}</span></div>`).join('')}</div>`:'<div class="empty">Anote VODs por categoria para transformar erros recorrentes em drills.</div>'}<button class="btn" data-go-vod>Revisar VOD</button></section>
    <section class="card"><span class="eyebrow">COACH RULES</span><h3>Regras de execução</h3><div class="coach-rule-list"><div><b>01</b><p>Não avaliar somente a luta final; voltar 30–60s para procurar a decisão que criou a posição.</p></div><div><b>02</b><p>Rotação boa exige wave resolvida, caminho aceitável e recompensa clara.</p></div><div><b>03</b><p>Ward precisa responder uma pergunta do próximo plano.</p></div><div><b>04</b><p>Jungle planeja sequência curta: ação atual + próximos dois movimentos.</p></div><div><b>05</b><p>Depois da vantagem, converter e sair — não devolver shutdown por excesso.</p></div></div></section>
  </div>
</div>`;}
export function bindPerformanceCenter(rerender){
  document.querySelector('#coachObjective')?.addEventListener('change',e=>store.update(s=>s.training.coach.objective=e.target.value));
  document.querySelectorAll('[data-coach-check]').forEach(i=>i.onchange=()=>{store.update(s=>s.training.coach.checks[i.dataset.coachCheck]=i.checked);rerender();});
  document.querySelectorAll('[data-coach-call]').forEach(b=>b.onclick=()=>{store.update(s=>s.training.coach.call=b.dataset.coachCall);rerender();});
  document.querySelectorAll('[data-vision-purpose]').forEach(b=>b.onclick=()=>{store.update(s=>s.training.coach.visionPurpose=b.dataset.visionPurpose);rerender();});
  document.querySelector('#coachNotes')?.addEventListener('change',e=>store.update(s=>s.training.coach.notes=e.target.value));
  document.querySelector('#coachSaveSession')?.addEventListener('click',()=>{const c=structuredClone(store.state.training.coach);store.update(s=>s.training.sessions.push({id:uid(),type:'OBJECTIVE_SETUP_DRILL',objective:c.objective,call:c.call,checks:c.checks,notes:c.notes,visionPurpose:c.visionPurpose,createdAt:new Date().toISOString()}));alert('Drill salvo no workspace.');});
  document.querySelector('#coachResetSetup')?.addEventListener('click',()=>{store.update(s=>s.training.coach={objective:s.training.coach.objective||'Dragon',call:'',checks:{},notes:'',visionPurpose:'OBJECTIVE'});rerender();});
  document.querySelector('#coachOpenTactical')?.addEventListener('click',()=>location.hash='#/tactical');document.querySelector('[data-go-vod]')?.addEventListener('click',()=>location.hash='#/vod');
}
