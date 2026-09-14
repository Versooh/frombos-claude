import { CHAMPIONS } from './data.js';
import { store } from './store.js';

const MAP_URL = 'https://puu.sh/j5JOG/0f458a62b3.jpg';
const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_SCENARIOS = ['LVL 1','03:00','1º OBJ','MID GAME','BARON'];
const TOOLS = [
  ['select','⌖','Selecionar'],['champion','●','Campeão'],['ward','◉','Ward'],['control','◆','Controle'],
  ['arrow','➜','Rota'],['pen','✎','Caneta'],['zone','◌','Zona'],['danger','!','Perigo'],['objective','⬡','Objetivo'],['text','T','Texto'],['eraser','⌫','Apagar']
];
const uid = () => Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-5);
const clone = value => JSON.parse(JSON.stringify(value));
const emptyScenario = (name='CENÁRIO') => ({ id: uid(), name, markers: [], paths: [], coach: { winCondition:'', strongSide:'', firstObjective:'', avoid:'', tags:[] }, layers: { routes:true,zones:true,objectives:true,vision:true,champions:true,notes:true } });

function ensureState(){
  store.update(s=>{
    if (!s.tactical || typeof s.tactical !== 'object') s.tactical = {};
    if (!s.tactical.scenarios || Array.isArray(s.tactical.scenarios)) s.tactical.scenarios = DEFAULT_SCENARIOS.map(emptyScenario);
    if (!s.tactical.scenarios.length) s.tactical.scenarios = DEFAULT_SCENARIOS.map(emptyScenario);
    if (!s.tactical.activeScenario || !s.tactical.scenarios.some(x=>x.id===s.tactical.activeScenario)) s.tactical.activeScenario = s.tactical.scenarios[0].id;
    if (Array.isArray(s.tactical.strokes) && s.tactical.strokes.length) {
      const target=s.tactical.scenarios.find(x=>x.id===s.tactical.activeScenario);
      target.paths.push(...s.tactical.strokes.map(st=>({id:uid(),type:'free',color:st.color||'#147aff',width:7,points:(st.points||[]).map(p=>({x:p.x*1000,y:p.y*1000}))})));
      s.tactical.strokes=[];
    }
  });
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function active(){ return store.state.tactical.scenarios.find(x=>x.id===store.state.tactical.activeScenario) || store.state.tactical.scenarios[0]; }

export function tacticalHTML(){
  ensureState();
  const t=store.state.tactical; const a=active();
  return `<div class="tactical-shell">
    <div class="tactical-topline">
      <div class="scenario-control"><span class="eyebrow">CENÁRIO</span><select class="select" id="tbScenario">${t.scenarios.map(s=>`<option value="${s.id}" ${s.id===a.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select><button class="btn" id="tbAddScenario">＋</button></div>
      <div class="top-actions"><button class="btn" id="tbUndo">↶ Desfazer</button><button class="btn" id="tbRedo">↷ Refazer</button><button class="btn" id="tbSave">Salvar</button><button class="btn info" id="tbShare">Compartilhar</button><button class="btn primary" id="tbExport">Exportar JSON</button></div>
    </div>
    <div class="tactical-grid">
      <aside class="card tb-panel tb-left">
        <div class="section-title"><div><div class="eyebrow">PEÇAS DO MAPA</div><h3>Campeões</h3></div><span class="badge blue">WILD RIFT</span></div>
        <div class="team-toggle" id="tbTeam"><button class="active" data-team="blue">Time Azul</button><button data-team="red">Time Vermelho</button></div>
        <input class="input" id="tbChampionSearch" placeholder="Buscar campeão...">
        <div class="tb-champ-grid" id="tbChampGrid"></div>
        <p class="muted tb-small">Os nomes vêm do roster Wild Rift do projeto. Portraits de League PC não são usados.</p>
      </aside>
      <section class="tb-center">
        <div class="tb-toolbar" id="tbToolbar">${TOOLS.map(([id,icon,label])=>`<button class="tb-tool ${id==='select'?'active':''}" data-tool="${id}" title="${label}"><span>${icon}</span><b>${label}</b></button>`).join('')}<input type="color" id="tbColor" value="#53d4ff" title="Cor"></div>
        <div class="tb-board-card">
          <div class="tb-board-meta"><div><strong>WILD RIFT</strong><span>mapa exato recuperado • board de análise</span></div><div class="tb-zoom"><button id="tbZoomOut">−</button><span id="tbZoomLabel">100%</span><button id="tbZoomIn">＋</button><button id="tbZoomReset">↺</button></div></div>
          <div class="tb-viewport" id="tbViewport"><div class="tb-stage" id="tbStage"><svg id="tbBoard" viewBox="0 0 1000 1000" aria-label="FROMBOS Tactical Board">
            <defs><clipPath id="tbMapClip"><rect width="1000" height="1000" rx="24"/></clipPath><marker id="tbArrowHead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="context-stroke"/></marker></defs>
            <rect width="1000" height="1000" rx="24" fill="#02070b"/>
            <image id="tbMapImage" href="${MAP_URL}" x="0" y="0" width="1000" height="1000" preserveAspectRatio="xMidYMid meet" clip-path="url(#tbMapClip)"/>
            <g id="tbRoutes"></g><g id="tbZones"></g><g id="tbObjectives"></g><g id="tbVision"></g><g id="tbChampions"></g><g id="tbNotes"></g><g id="tbTemp"></g>
          </svg></div></div>
          <div class="tb-board-footer"><div><span class="tb-legend blue"></span> aliado <span class="tb-legend red"></span> inimigo <span>◉ ward</span> <span>⬡ objetivo</span></div><span id="tbStatus">Selecionar • arraste peças para mover</span></div>
        </div>
      </section>
      <aside class="card tb-panel tb-right">
        <div class="section-title"><div><div class="eyebrow">COACH VIEW</div><h3>Leitura do plano</h3></div></div>
        <label>Win condition<textarea class="input" id="tbWin" rows="3" placeholder="Ex.: jogar bot side, acelerar 1º dragão..."></textarea></label>
        <div class="form-row"><label>Strong side<select class="select" id="tbStrong"><option value="">—</option><option>Top</option><option>Mid</option><option>Bot</option><option>Cross-map</option></select></label><label>1º objetivo<select class="select" id="tbFirst"><option value="">—</option><option>Dragão</option><option>Herald</option><option>Torres</option><option>Invade</option><option>Trade</option></select></label></div>
        <label>Evitar<textarea class="input" id="tbAvoid" rows="2" placeholder="Facecheck sem prioridade, contest 4v5..."></textarea></label>
        <div class="section-title"><h3>Identidade</h3></div><div class="tag-cloud" id="tbTags">${['Early','Scaling','Engage','Pick','Poke','Dive','Front-to-back','Peel','Split','Wombo'].map(x=>`<button data-tag="${x}">${x}</button>`).join('')}</div>
        <div class="section-title"><h3>Camadas</h3><button class="text-btn" id="tbShowLayers">Mostrar todas</button></div>
        <div class="layer-grid" id="tbLayers">${[['routes','Rotas'],['zones','Zonas'],['objectives','Objetivos'],['vision','Visão'],['champions','Campeões'],['notes','Notas']].map(([id,label])=>`<label><input type="checkbox" data-layer="${id}" checked> ${label}</label>`).join('')}</div>
        <div class="section-title"><h3>Resumo tático</h3><button class="text-btn" id="tbCopySummary">Copiar</button></div><div class="summary-card" id="tbSummary"></div>
      </aside>
    </div>
    <div class="modal-backdrop" id="tbTextModal" hidden><div class="modal-card"><div class="eyebrow">ANOTAÇÃO</div><h3>Adicionar texto ao mapa</h3><textarea class="input" id="tbTextInput" rows="4" placeholder="MID PUSH → MOVE → DRAGÃO"></textarea><div class="top-actions"><button class="btn" id="tbTextCancel">Cancelar</button><button class="btn primary" id="tbTextConfirm">Adicionar</button></div></div></div>
  </div>`;
}

export function bindTacticalBoard(rerender){
  ensureState();
  let tool='select', team='blue', selectedChampion=null, selectedId=null, drawing=null, dragging=null, pendingText=null, zoom=1;
  let undo=[], redo=[];
  const $=q=>document.querySelector(q);
  const els={board:$('#tbBoard'),routes:$('#tbRoutes'),zones:$('#tbZones'),objectives:$('#tbObjectives'),vision:$('#tbVision'),champions:$('#tbChampions'),notes:$('#tbNotes'),temp:$('#tbTemp')};
  if(!els.board) return;
  const scenario=()=>active();
  const save=()=>store.save();
  const snapshot=()=>clone(scenario());
  const push=()=>{undo.push(snapshot());if(undo.length>50)undo.shift();redo=[];};
  const svg=(tag,attrs={})=>{const el=document.createElementNS(SVG_NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el;};
  const point=e=>{const r=els.board.getBoundingClientRect();return{x:Math.max(0,Math.min(1000,(e.clientX-r.left)/r.width*1000)),y:Math.max(0,Math.min(1000,(e.clientY-r.top)/r.height*1000))};};
  const layerMap={routes:els.routes,zones:els.zones,objectives:els.objectives,vision:els.vision,champions:els.champions,notes:els.notes};

  function render(){Object.values(layerMap).forEach(g=>g.innerHTML='');scenario().paths.forEach(renderPath);scenario().markers.forEach(renderMarker);applyLayers();updateCoach();renderChampGrid();}
  function renderPath(p){let el;if(p.type==='free')el=svg('polyline',{points:p.points.map(q=>`${q.x},${q.y}`).join(' '),fill:'none',stroke:p.color||'#53d4ff','stroke-width':p.width||7,'stroke-linecap':'round','stroke-linejoin':'round','data-path-id':p.id});if(p.type==='arrow')el=svg('line',{x1:p.a.x,y1:p.a.y,x2:p.b.x,y2:p.b.y,stroke:p.color||'#53d4ff','stroke-width':p.width||9,'stroke-linecap':'round','marker-end':'url(#tbArrowHead)','data-path-id':p.id});if(p.type==='zone')el=svg('ellipse',{cx:p.c.x,cy:p.c.y,rx:p.rx,ry:p.ry,fill:p.color||'#53d4ff','fill-opacity':.12,stroke:p.color||'#53d4ff','stroke-width':5,'stroke-dasharray':'14 10','data-path-id':p.id});if(el)(p.type==='zone'?els.zones:els.routes).appendChild(el);}
  function renderMarker(m){
    let layer=els.notes;if(m.type==='champion')layer=els.champions;if(['ward','control'].includes(m.type))layer=els.vision;if(['objective','danger'].includes(m.type))layer=els.objectives;
    const g=svg('g',{'data-marker-id':m.id,transform:`translate(${m.x} ${m.y})`,style:'cursor:pointer'});if(selectedId===m.id)g.appendChild(svg('circle',{r:40,fill:'none',stroke:'#fff','stroke-width':2,'stroke-dasharray':'6 5','stroke-opacity':.8}));
    if(m.type==='champion'){const c=m.team==='red'?'#ff5364':'#43ccff';g.appendChild(svg('circle',{r:31,fill:m.team==='red'?'#41131b':'#102b4d',stroke:c,'stroke-width':4}));const tx=svg('text',{x:0,y:5,'text-anchor':'middle',fill:'#fff','font-size':13,'font-weight':900});tx.textContent=(m.label||'?').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();g.appendChild(tx);const nm=svg('text',{x:0,y:51,'text-anchor':'middle',fill:'#fff','font-size':10,'font-weight':800});nm.textContent=(m.label||'').slice(0,15);g.appendChild(nm);}
    else if(['ward','control'].includes(m.type)){const c=m.type==='control'?'#ff5364':'#65dcff';g.appendChild(svg('circle',{r:105,fill:c,'fill-opacity':.07,stroke:c,'stroke-opacity':.32,'stroke-width':2,'stroke-dasharray':'8 8'}));g.appendChild(svg('circle',{r:20,fill:'#061017',stroke:c,'stroke-width':3}));g.appendChild(svg('path',{d:'M-11 0 Q0 -10 11 0 Q0 10 -11 0Z',fill:'none',stroke:c,'stroke-width':2.5}));g.appendChild(svg('circle',{r:4,fill:c}));g.appendChild(svg('line',{x1:0,y1:20,x2:0,y2:30,stroke:c,'stroke-width':3}));}
    else if(m.type==='danger'){g.appendChild(svg('path',{d:'M0 -26 L25 21 L-25 21 Z',fill:'#3c1117',stroke:'#ff667d','stroke-width':4}));const t=svg('text',{y:13,'text-anchor':'middle',fill:'#ff94a3','font-size':27,'font-weight':900});t.textContent='!';g.appendChild(t);}
    else if(m.type==='objective'){g.appendChild(svg('path',{d:'M0 -27 L24 -14 L24 14 L0 27 L-24 14 L-24 -14Z',fill:'#302512',stroke:'#e0b766','stroke-width':4}));const t=svg('text',{y:6,'text-anchor':'middle',fill:'#f0cf8d','font-size':15,'font-weight':900});t.textContent='OBJ';g.appendChild(t);}
    else if(m.type==='text'){const w=Math.max(120,Math.min(320,(m.label||'').length*7+28));g.appendChild(svg('rect',{x:0,y:-18,width:w,height:40,rx:8,fill:'#061018','fill-opacity':.9,stroke:m.color||'#53d4ff','stroke-width':2}));const t=svg('text',{x:12,y:7,fill:'#fff','font-size':14,'font-weight':700});t.textContent=(m.label||'').slice(0,42);g.appendChild(t);}
    layer.appendChild(g);
  }
  function renderTemp(){els.temp.innerHTML='';if(!drawing)return;const c=$('#tbColor').value;if(drawing.type==='free')els.temp.appendChild(svg('polyline',{points:drawing.points.map(q=>`${q.x},${q.y}`).join(' '),fill:'none',stroke:c,'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round'}));if(drawing.type==='arrow')els.temp.appendChild(svg('line',{x1:drawing.a.x,y1:drawing.a.y,x2:drawing.b.x,y2:drawing.b.y,stroke:c,'stroke-width':9,'marker-end':'url(#tbArrowHead)'}));if(drawing.type==='zone'){const c0={x:(drawing.a.x+drawing.b.x)/2,y:(drawing.a.y+drawing.b.y)/2};els.temp.appendChild(svg('ellipse',{cx:c0.x,cy:c0.y,rx:Math.abs(drawing.b.x-drawing.a.x)/2,ry:Math.abs(drawing.b.y-drawing.a.y)/2,fill:c,'fill-opacity':.12,stroke:c,'stroke-width':5,'stroke-dasharray':'14 10'}));}}
  function applyLayers(){Object.entries(scenario().layers||{}).forEach(([k,v])=>{if(layerMap[k])layerMap[k].style.display=v?'':'none';const cb=document.querySelector(`[data-layer="${k}"]`);if(cb)cb.checked=!!v;});}
  function addMarker(type,p,extra={}){push();scenario().markers.push({id:uid(),type,x:p.x,y:p.y,...extra});save();render();}
  function deleteAt(target){const id=target.closest?.('[data-marker-id]')?.dataset.markerId;const pid=target.closest?.('[data-path-id]')?.dataset.pathId;if(!id&&!pid)return false;push();scenario().markers=scenario().markers.filter(x=>x.id!==id);scenario().paths=scenario().paths.filter(x=>x.id!==pid);selectedId=null;save();render();return true;}
  function finishDrawing(){if(!drawing)return;push();const c=$('#tbColor').value;if(drawing.type==='free'&&drawing.points.length>1)scenario().paths.push({id:uid(),type:'free',points:drawing.points,color:c,width:7});if(drawing.type==='arrow')scenario().paths.push({id:uid(),type:'arrow',a:drawing.a,b:drawing.b,color:c,width:9});if(drawing.type==='zone'){const cc={x:(drawing.a.x+drawing.b.x)/2,y:(drawing.a.y+drawing.b.y)/2};scenario().paths.push({id:uid(),type:'zone',c:cc,rx:Math.abs(drawing.b.x-drawing.a.x)/2,ry:Math.abs(drawing.b.y-drawing.a.y)/2,color:c});}drawing=null;save();render();}
  function updateCoach(){const c=scenario().coach||{};$('#tbWin').value=c.winCondition||'';$('#tbStrong').value=c.strongSide||'';$('#tbFirst').value=c.firstObjective||'';$('#tbAvoid').value=c.avoid||'';document.querySelectorAll('#tbTags [data-tag]').forEach(b=>b.classList.toggle('active',(c.tags||[]).includes(b.dataset.tag)));const lines=[];if(c.tags?.length)lines.push(`IDENTIDADE: ${c.tags.join(' / ')}`);if(c.winCondition)lines.push(`WIN CONDITION: ${c.winCondition}`);if(c.strongSide)lines.push(`STRONG SIDE: ${c.strongSide}`);if(c.firstObjective)lines.push(`1º OBJETIVO: ${c.firstObjective}`);if(c.avoid)lines.push(`EVITAR: ${c.avoid}`);$('#tbSummary').innerHTML=lines.length?lines.map(x=>`<p>${esc(x)}</p>`).join(''):'<p>Preencha a leitura do coach para gerar o resumo.</p>';}
  function renderChampGrid(){const q=$('#tbChampionSearch').value.trim().toLowerCase();$('#tbChampGrid').innerHTML=CHAMPIONS.filter(x=>x.toLowerCase().includes(q)).slice(0,141).map(c=>`<button class="tb-champ ${selectedChampion===c?'active':''}" data-champion="${esc(c)}"><span>${esc(c.split(/\s+/).map(x=>x[0]).slice(0,2).join(''))}</span><small>${esc(c)}</small></button>`).join('');document.querySelectorAll('[data-champion]').forEach(b=>b.onclick=()=>{selectedChampion=b.dataset.champion;tool='champion';setTool('champion');renderChampGrid();});}
  function setTool(id){tool=id;document.querySelectorAll('.tb-tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===id));$('#tbStatus').textContent=({select:'Selecionar • arraste peças para mover',champion:'Campeão • escolha e clique no mapa',ward:'Ward • clique no mapa (range visível)',control:'Controle • clique no mapa (range visível)',arrow:'Rota • arraste do início ao fim',pen:'Caneta • desenhe livremente',zone:'Zona • arraste para criar área',danger:'Perigo • clique no mapa',objective:'Objetivo • clique no mapa',text:'Texto • clique no mapa',eraser:'Apagar • clique em um item'})[id]||id;}
  function saveCoach(){store.update(s=>{const sc=s.tactical.scenarios.find(x=>x.id===s.tactical.activeScenario);sc.coach.winCondition=$('#tbWin').value;sc.coach.strongSide=$('#tbStrong').value;sc.coach.firstObjective=$('#tbFirst').value;sc.coach.avoid=$('#tbAvoid').value;});updateCoach();}

  $('#tbScenario').onchange=e=>{store.update(s=>s.tactical.activeScenario=e.target.value);rerender();};
  $('#tbAddScenario').onclick=()=>{const name=prompt('Nome do novo cenário:','NOVO CENÁRIO');if(!name)return;store.update(s=>{const sc=emptyScenario(name.trim());s.tactical.scenarios.push(sc);s.tactical.activeScenario=sc.id;});rerender();};
  document.querySelectorAll('.tb-tool').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
  document.querySelectorAll('#tbTeam [data-team]').forEach(b=>b.onclick=()=>{team=b.dataset.team;document.querySelectorAll('#tbTeam [data-team]').forEach(x=>x.classList.toggle('active',x===b));});
  $('#tbChampionSearch').oninput=renderChampGrid;
  $('#tbUndo').onclick=()=>{if(!undo.length)return;redo.push(snapshot());const prev=undo.pop();store.update(s=>{const i=s.tactical.scenarios.findIndex(x=>x.id===s.tactical.activeScenario);s.tactical.scenarios[i]=prev;});render();};
  $('#tbRedo').onclick=()=>{if(!redo.length)return;undo.push(snapshot());const next=redo.pop();store.update(s=>{const i=s.tactical.scenarios.findIndex(x=>x.id===s.tactical.activeScenario);s.tactical.scenarios[i]=next;});render();};
  $('#tbSave').onclick=()=>{save();alert('Plano salvo neste navegador.');};
  $('#tbShare').onclick=()=>{const payload=btoa(unescape(encodeURIComponent(JSON.stringify(store.state.tactical)))).replace(/=+$/,'');const url=new URL(location.href);url.hash=`#/tactical?plan=${payload}`;navigator.clipboard?.writeText(url.toString()).then(()=>alert('Link da sessão copiado.')).catch(()=>prompt('Copie o link:',url.toString()));};
  $('#tbExport').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(store.state.tactical,null,2)],{type:'application/json'}));a.download='frombos-tactical-plan.json';a.click();URL.revokeObjectURL(a.href);};
  $('#tbZoomIn').onclick=()=>{zoom=Math.min(2,zoom+.1);$('#tbStage').style.width=`${zoom*100}%`;$('#tbZoomLabel').textContent=`${Math.round(zoom*100)}%`;};$('#tbZoomOut').onclick=()=>{zoom=Math.max(.65,zoom-.1);$('#tbStage').style.width=`${zoom*100}%`;$('#tbZoomLabel').textContent=`${Math.round(zoom*100)}%`;};$('#tbZoomReset').onclick=()=>{zoom=1;$('#tbStage').style.width='100%';$('#tbZoomLabel').textContent='100%';};
  ['#tbWin','#tbStrong','#tbFirst','#tbAvoid'].forEach(q=>$(q).addEventListener('change',saveCoach));
  document.querySelectorAll('#tbTags [data-tag]').forEach(b=>b.onclick=()=>{store.update(s=>{const sc=s.tactical.scenarios.find(x=>x.id===s.tactical.activeScenario);sc.coach.tags=sc.coach.tags||[];sc.coach.tags=sc.coach.tags.includes(b.dataset.tag)?sc.coach.tags.filter(x=>x!==b.dataset.tag):[...sc.coach.tags,b.dataset.tag];});updateCoach();});
  document.querySelectorAll('[data-layer]').forEach(cb=>cb.onchange=()=>{scenario().layers[cb.dataset.layer]=cb.checked;save();applyLayers();});$('#tbShowLayers').onclick=()=>{Object.keys(scenario().layers).forEach(k=>scenario().layers[k]=true);save();applyLayers();};$('#tbCopySummary').onclick=()=>navigator.clipboard?.writeText($('#tbSummary').innerText||'');
  $('#tbTextCancel').onclick=()=>{$('#tbTextModal').hidden=true;pendingText=null;};$('#tbTextConfirm').onclick=()=>{const label=$('#tbTextInput').value.trim();if(label&&pendingText)addMarker('text',pendingText,{label,color:$('#tbColor').value});$('#tbTextModal').hidden=true;$('#tbTextInput').value='';pendingText=null;};

  els.board.addEventListener('pointerdown',e=>{const p=point(e);if(tool==='eraser'){deleteAt(e.target);return;}const marker=e.target.closest?.('[data-marker-id]');if(tool==='select'&&marker){selectedId=marker.dataset.markerId;const m=scenario().markers.find(x=>x.id===selectedId);dragging={id:selectedId,before:snapshot(),dx:p.x-m.x,dy:p.y-m.y};render();return;}if(tool==='select'){selectedId=null;render();return;}if(tool==='champion'){if(selectedChampion)addMarker('champion',p,{team,label:selectedChampion});return;}if(['ward','control','danger','objective'].includes(tool)){addMarker(tool,p);return;}if(tool==='text'){pendingText=p;$('#tbTextModal').hidden=false;setTimeout(()=>$('#tbTextInput').focus(),0);return;}if(tool==='pen'){drawing={type:'free',points:[p]};renderTemp();return;}if(tool==='arrow'||tool==='zone'){drawing={type:tool,a:p,b:p};renderTemp();}});
  els.board.addEventListener('pointermove',e=>{const p=point(e);if(dragging){const m=scenario().markers.find(x=>x.id===dragging.id);if(m){m.x=p.x-dragging.dx;m.y=p.y-dragging.dy;render();}return;}if(!drawing)return;if(drawing.type==='free')drawing.points.push(p);else drawing.b=p;renderTemp();});
  window.addEventListener('pointerup',()=>{if(dragging){undo.push(dragging.before);if(undo.length>50)undo.shift();redo=[];dragging=null;save();render();return;}if(drawing)finishDrawing();});
  window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const k=e.key.toLowerCase();if(k==='v')setTool('select');if(k==='w')setTool('ward');if(k==='r')setTool('arrow');if(k==='p')setTool('pen');if(k==='t')setTool('text');if(e.key==='Delete'&&selectedId){push();scenario().markers=scenario().markers.filter(x=>x.id!==selectedId);selectedId=null;save();render();}});
  render();
}
