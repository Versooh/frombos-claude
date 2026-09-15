const SVG_NS='http://www.w3.org/2000/svg';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
let installed=false;
function button(label,id){const b=document.createElement('button');b.className='btn';b.id=id;b.textContent=label;return b;}
function enhance(){
  if(installed||!document.querySelector('#tbBoard'))return;
  installed=true;
  const board=document.querySelector('#tbBoard'), viewport=document.querySelector('#tbViewport'), toolbar=document.querySelector('#tbToolbar'), top=document.querySelector('.tactical-topline');
  if(!board||!viewport)return;
  const extra=document.createElement('div');extra.className='tb-enhanced-tools';
  const measure=button('⌗ Medir','tbMeasure'), grid=button('▦ Grade','tbGrid'), fit=button('⛶ Enquadrar','tbFit'), snapshot=button('◎ Snapshot','tbSnapshot'), clear=button('Limpar camada','tbClearLayer');
  [measure,grid,fit,snapshot,clear].forEach(x=>extra.appendChild(x));
  toolbar?.appendChild(extra);
  const timeline=document.createElement('div');timeline.className='tb-timeline';timeline.innerHTML='<div class="eyebrow">LINHA DE EXECUÇÃO</div><div class="tb-timeline-row"><input id="tbTimeline" type="range" min="0" max="1800" value="0" step="15"><output id="tbTimelineOut">00:00</output><button class="btn" id="tbTimelineAdd">＋ Marco</button></div><div id="tbTimelineMarks" class="tb-timeline-marks"></div>';
  document.querySelector('.tb-board-card')?.appendChild(timeline);
  const timelineInput=timeline.querySelector('#tbTimeline'), output=timeline.querySelector('#tbTimelineOut'), marks=timeline.querySelector('#tbTimelineMarks');
  const state={grid:false,measure:false,points:[],markers:[]};
  function fmt(s){const m=Math.floor(s/60),sec=String(s%60).padStart(2,'0');return `${String(m).padStart(2,'0')}:${sec}`;}
  timelineInput.oninput=()=>output.value=fmt(+timelineInput.value);
  timeline.querySelector('#tbTimelineAdd').onclick=()=>{const time=+timelineInput.value;const tag=prompt('Nome do marco tático:',time?`Objetivo ${fmt(time)}`:'Abertura');if(!tag)return;state.markers.push({id:uid(),time,tag});renderMarks();};
  function renderMarks(){marks.innerHTML=state.markers.sort((a,b)=>a.time-b.time).map(m=>`<button class="tb-time-mark" data-time="${m.time}"><b>${fmt(m.time)}</b> ${esc(m.tag)}</button>`).join('');marks.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{timelineInput.value=b.dataset.time;timelineInput.dispatchEvent(new Event('input'));});}
  grid.onclick=()=>{state.grid=!state.grid;grid.classList.toggle('active',state.grid);let g=board.querySelector('#tbEnhGrid');if(state.grid&&!g){g=document.createElementNS(SVG_NS,'g');g.id='tbEnhGrid';for(let i=50;i<1000;i+=50){g.appendChild(Object.assign(document.createElementNS(SVG_NS,'line'),{className:'tb-grid-line'}));g.lastChild.setAttribute('x1',i);g.lastChild.setAttribute('x2',i);g.lastChild.setAttribute('y1',0);g.lastChild.setAttribute('y2',1000);g.appendChild(document.createElementNS(SVG_NS,'line'));const l=g.lastChild;l.setAttribute('x1',0);l.setAttribute('x2',1000);l.setAttribute('y1',i);l.setAttribute('y2',i);}board.appendChild(g);}if(g)g.style.display=state.grid?'block':'none';};
  fit.onclick=()=>{viewport.scrollTo({left:0,top:0,behavior:'smooth'});const stage=document.querySelector('#tbStage');if(stage){stage.style.transform='scale(1)';stage.style.transformOrigin='top left';}};
  measure.onclick=()=>{state.measure=!state.measure;measure.classList.toggle('active',state.measure);measure.textContent=state.measure?'⌗ Medindo…':'⌗ Medir';state.points=[];};
  board.addEventListener('click',e=>{if(!state.measure)return;const r=board.getBoundingClientRect(),p={x:(e.clientX-r.left)/r.width*1000,y:(e.clientY-r.top)/r.height*1000};state.points.push(p);if(state.points.length<2)return;const a=state.points[0],b=state.points[1],dx=b.x-a.x,dy=b.y-a.y,d=Math.round(Math.hypot(dx,dy));let layer=document.querySelector('#tbMeasureLayer');if(!layer){layer=document.createElementNS(SVG_NS,'g');layer.id='tbMeasureLayer';board.appendChild(layer);}layer.innerHTML=`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/><circle cx="${a.x}" cy="${a.y}" r="8" fill="#fff"/><circle cx="${b.x}" cy="${b.y}" r="8" fill="#fff"/><text x="${(a.x+b.x)/2}" y="${(a.y+b.y)/2-12}" fill="#fff" font-size="18" font-weight="900" text-anchor="middle">${d}u</text>`;state.points=[];});
  clear.onclick=()=>{if(!confirm('Limpar as anotações visuais do cenário atual?'))return;document.querySelector('#tbMeasureLayer')?.remove();document.querySelectorAll('#tbRoutes [data-path-id],#tbZones [data-path-id],#tbObjectives [data-marker-id],#tbVision [data-marker-id],#tbChampions [data-marker-id],#tbNotes [data-marker-id]').forEach(x=>x.remove());};
  snapshot.onclick=()=>{const clone=board.cloneNode(true);clone.querySelectorAll('#tbTemp,#tbMeasureLayer,#tbEnhGrid').forEach(x=>x.remove());const xml=new XMLSerializer().serializeToString(clone);const blob=new Blob([xml],{type:'image/svg+xml'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`frombos-tactical-${Date.now()}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);};
  if(top){const badge=document.createElement('span');badge.className='badge cyan';badge.textContent='TACTICAL PRO';top.querySelector('.scenario-control')?.appendChild(badge);}
}
const observer=new MutationObserver(enhance);observer.observe(document.body,{childList:true,subtree:true});enhance();