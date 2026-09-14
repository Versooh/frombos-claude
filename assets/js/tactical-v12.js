import { store } from './store.js';

const SVG_NS='http://www.w3.org/2000/svg';
const MAP_LOCAL='assets/img/wild-rift-map.jpg';
const state={mode:null,selectedId:null,drag:null,raf:0};
const $=q=>document.querySelector(q);
const $$=q=>[...document.querySelectorAll(q)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-5);
const svg=(tag,attrs={})=>{const el=document.createElementNS(SVG_NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;};
const scenario=()=>{const t=store.state.tactical;if(!t?.scenarios?.length)return null;return t.scenarios.find(s=>s.id===t.activeScenario)||t.scenarios[0];};
const allScenarios=()=>store.state.tactical?.scenarios||[];
const items=(s=scenario())=>{if(!s)return[];if(!Array.isArray(s.v12Items))s.v12Items=[];return s.v12Items;};
const selected=()=>items().find(x=>x.id===state.selectedId)||null;
const save=()=>store.save?.();
const team=()=>document.querySelector('#tbTeam button.active')?.dataset.team||'blue';
const color=t=>t==='red'?'#ff5364':'#43ccff';

function parseDuration(value){const m=String(value||'').trim().match(/^(?:(\d+):)?(\d{1,2})$/);if(!m)return null;const a=Number(m[1]||0),b=Number(m[2]);return m[1]?a*60+b:b;}
function formatDuration(sec){sec=Math.max(0,Math.ceil(Number(sec)||0));const m=Math.floor(sec/60),s=sec%60;return`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function remaining(i){return i.running?Math.max(0,(Number(i.endsAt)||0-Date.now())/1000):Math.max(0,Number(i.remainingSec??i.durationSec)||0);}
function boardPoint(e){const board=$('#tbBoard'),r=board?.getBoundingClientRect();if(!r)return null;return{x:Math.max(0,Math.min(1000,(e.clientX-r.left)/r.width*1000)),y:Math.max(0,Math.min(1000,(e.clientY-r.top)/r.height*1000))};}

function ensureToolbar(){
  const bar=$('#tbToolbar');if(!bar||bar.querySelector('[data-v12-tool]'))return;
  const eraser=bar.querySelector('[data-tool="eraser"]');
  const defs=[['wave','≋','Wave'],['timer','⏱','Timer']];
  for(const[id,icon,label]of defs){const b=document.createElement('button');b.className='tb-tool';b.dataset.v12Tool=id;b.title=label;b.innerHTML=`<span>${icon}</span><b>${label}</b>`;b.onclick=()=>setMode(state.mode===id?null:id);bar.insertBefore(b,eraser||null);}
}
function ensureActions(){
  const host=document.querySelector('.tactical-topline .top-actions');if(!host||host.querySelector('#tbCompareScenes'))return;
  const compare=document.createElement('button');compare.className='btn';compare.id='tbCompareScenes';compare.textContent='Comparar';compare.onclick=openCompare;
  const png=document.createElement('button');png.className='btn';png.id='tbExportPng';png.textContent='Exportar PNG';png.onclick=exportPNG;
  const full=document.createElement('button');full.className='btn';full.id='tbFullscreen';full.textContent='Tela cheia';full.onclick=toggleFullscreen;
  host.append(compare,png,full);
}
function ensureOverlay(){const board=$('#tbBoard');if(!board)return null;let g=$('#tbV12Overlay');if(!g){g=svg('g',{id:'tbV12Overlay'});board.appendChild(g);}return g;}
function ensurePanel(){
  const right=document.querySelector('.tb-right');if(!right||right.querySelector('#tbV12Panel'))return;
  const box=document.createElement('section');box.id='tbV12Panel';box.className='tb-v12-panel';box.innerHTML=`<div class="section-title"><div><div class="eyebrow">WAVES & TIMERS</div><h3>Item V12</h3></div><span class="badge gold" id="tbV12Type">—</span></div><div id="tbV12Empty" class="muted tb-small">Use Wave ou Timer na barra e clique no mapa.</div><div id="tbV12Fields" hidden><label>Rótulo<input class="input" id="tbV12Label"></label><label id="tbV12TeamWrap">Lado<select class="select" id="tbV12Team"><option value="blue">Azul</option><option value="red">Vermelho</option></select></label><div id="tbV12TimerFields"><label>Duração<input class="input" id="tbV12Duration" placeholder="01:30"></label><div class="tb-v12-actions"><button class="btn" id="tbV12ToggleTimer">Pausar</button><button class="btn" id="tbV12ResetTimer">Reiniciar</button></div></div><button class="btn danger tb-v12-delete" id="tbV12Delete">Excluir item</button></div>`;
  const anchor=right.querySelector('#tbInspector');if(anchor)anchor.insertAdjacentElement('afterend',box);else right.appendChild(box);
  $('#tbV12Label').onchange=e=>{const i=selected();if(!i)return;i.label=e.target.value.trim()||i.label;save();render();};
  $('#tbV12Team').onchange=e=>{const i=selected();if(!i)return;i.team=e.target.value;save();render();};
  $('#tbV12Duration').onchange=e=>{const i=selected(),sec=parseDuration(e.target.value);if(!i||i.type!=='timer'||!sec)return;i.durationSec=sec;i.remainingSec=sec;i.endsAt=Date.now()+sec*1000;i.running=true;save();render();};
  $('#tbV12ToggleTimer').onclick=toggleTimer;$('#tbV12ResetTimer').onclick=resetTimer;$('#tbV12Delete').onclick=deleteSelected;
}
function ensureCompareModal(){
  if($('#tbCompareModal'))return;
  const modal=document.createElement('div');modal.className='modal-backdrop tb-compare-backdrop';modal.id='tbCompareModal';modal.hidden=true;modal.innerHTML=`<div class="modal-card tb-compare-modal"><div class="tb-compare-head"><div><div class="eyebrow">COMPARAÇÃO VISUAL</div><h3>Cenário A × Cenário B</h3></div><button class="btn" id="tbCompareClose">Fechar</button></div><div class="tb-compare-selects"><select class="select" id="tbCompareA"></select><select class="select" id="tbCompareB"></select></div><div class="tb-compare-grid" id="tbCompareGrid"></div></div>`;document.body.appendChild(modal);
  $('#tbCompareClose').onclick=()=>modal.hidden=true;$('#tbCompareA').onchange=renderCompare;$('#tbCompareB').onchange=renderCompare;modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true;});
}
function setMode(mode){state.mode=mode;state.selectedId=null;$$('[data-v12-tool]').forEach(b=>b.classList.toggle('active',b.dataset.v12Tool===mode));if(mode)$$('#tbToolbar [data-tool]').forEach(b=>b.classList.remove('active'));const s=$('#tbStatus');if(s)s.textContent=mode==='wave'?'Wave • clique no mapa para posicionar':mode==='timer'?'Timer • clique no mapa e informe a duração':'Selecionar • ferramentas V12 desativadas';syncPanel();}

function placeItem(e){
  if(!location.hash.startsWith('#/tactical')||!state.mode||!e.target.closest?.('#tbBoard'))return;
  const p=boardPoint(e);if(!p)return;e.preventDefault();e.stopImmediatePropagation();
  if(state.mode==='wave'){const i={id:uid(),type:'wave',x:p.x,y:p.y,team:team(),label:'WAVE'};items().push(i);state.selectedId=i.id;save();render();return;}
  const raw=window.prompt('Duração do timer (MM:SS):','01:30');if(raw===null)return;const sec=parseDuration(raw);if(!sec){window.alert('Use um tempo válido, por exemplo 01:30.');return;}const i={id:uid(),type:'timer',x:p.x,y:p.y,label:'TIMER',durationSec:sec,remainingSec:sec,running:true,endsAt:Date.now()+sec*1000};items().push(i);state.selectedId=i.id;save();render();
}
function render(){
  if(!location.hash.startsWith('#/tactical'))return;const layer=ensureOverlay();if(!layer)return;layer.innerHTML='';
  for(const i of items()){
    const g=svg('g',{'data-v12-id':i.id,transform:`translate(${i.x} ${i.y})`,class:state.selectedId===i.id?'tb-v12-selected-item':'',style:'cursor:grab'});
    if(i.type==='wave'){
      const c=color(i.team);g.appendChild(svg('circle',{cx:-17,cy:4,r:9,fill:c,'fill-opacity':.9,stroke:'#fff','stroke-opacity':.25,'stroke-width':1}));g.appendChild(svg('circle',{cx:0,cy:-7,r:10,fill:c,'fill-opacity':.95,stroke:'#fff','stroke-opacity':.25,'stroke-width':1}));g.appendChild(svg('circle',{cx:17,cy:4,r:9,fill:c,'fill-opacity':.9,stroke:'#fff','stroke-opacity':.25,'stroke-width':1}));const t=svg('text',{x:0,y:31,'text-anchor':'middle',fill:'#fff','font-size':9,'font-weight':900,stroke:'#02060b','stroke-width':2,'paint-order':'stroke'});t.textContent=i.label||'WAVE';g.appendChild(t);
    }else if(i.type==='timer'){
      let rem=remaining(i);if(rem<=0&&i.running){i.running=false;i.remainingSec=0;rem=0;save();}const expired=rem<=0;g.appendChild(svg('circle',{r:34,fill:'#050912','fill-opacity':.93,stroke:expired?'#ff5364':'#f0c97a','stroke-width':3}));const tt=svg('text',{x:0,y:5,'text-anchor':'middle',fill:expired?'#ff8490':'#f6dfaa','font-size':14,'font-weight':900});tt.textContent=formatDuration(rem);g.appendChild(tt);const lb=svg('text',{x:0,y:48,'text-anchor':'middle',fill:'#fff','font-size':9,'font-weight':900,stroke:'#02060b','stroke-width':2,'paint-order':'stroke'});lb.textContent=i.label||'TIMER';g.appendChild(lb);
    }
    if(state.selectedId===i.id)g.insertBefore(svg('circle',{r:i.type==='timer'?43:38,fill:'none',stroke:'#00d4ff','stroke-width':2,'stroke-dasharray':'6 5'}),g.firstChild);layer.appendChild(g);
  }
  syncPanel();
}
function syncPanel(){const i=selected(),empty=$('#tbV12Empty'),fields=$('#tbV12Fields');if(!empty||!fields)return;if(!i){empty.hidden=false;fields.hidden=true;if($('#tbV12Type'))$('#tbV12Type').textContent='—';return;}empty.hidden=true;fields.hidden=false;$('#tbV12Type').textContent=i.type==='wave'?'WAVE':'TIMER';$('#tbV12Label').value=i.label||'';$('#tbV12TeamWrap').hidden=i.type!=='wave';$('#tbV12TimerFields').hidden=i.type!=='timer';if(i.type==='wave')$('#tbV12Team').value=i.team||'blue';if(i.type==='timer'){$('#tbV12Duration').value=formatDuration(i.durationSec||0);$('#tbV12ToggleTimer').textContent=i.running?'Pausar':'Continuar';}}
function toggleTimer(){const i=selected();if(!i||i.type!=='timer')return;if(i.running){i.remainingSec=remaining(i);i.running=false;}else{const rem=i.remainingSec||i.durationSec||0;i.endsAt=Date.now()+rem*1000;i.running=true;}save();render();}
function resetTimer(){const i=selected();if(!i||i.type!=='timer')return;i.remainingSec=i.durationSec||0;i.endsAt=Date.now()+(i.durationSec||0)*1000;i.running=true;save();render();}
function deleteSelected(){if(!state.selectedId)return;const s=scenario();s.v12Items=items(s).filter(x=>x.id!==state.selectedId);state.selectedId=null;save();render();}

function selectItem(e){const g=e.target.closest?.('[data-v12-id]');if(!g)return;state.selectedId=g.dataset.v12Id;state.mode=null;$$('[data-v12-tool]').forEach(b=>b.classList.remove('active'));render();e.stopPropagation();}
function dragStart(e){const g=e.target.closest?.('[data-v12-id]');if(!g||state.mode)return;const i=items().find(x=>x.id===g.dataset.v12Id),p=boardPoint(e);if(!i||!p)return;state.selectedId=i.id;state.drag={id:i.id,dx:p.x-i.x,dy:p.y-i.y};e.preventDefault();e.stopImmediatePropagation();render();}
function dragMove(e){if(!state.drag)return;const i=items().find(x=>x.id===state.drag.id),p=boardPoint(e);if(!i||!p)return;i.x=Math.max(0,Math.min(1000,p.x-state.drag.dx));i.y=Math.max(0,Math.min(1000,p.y-state.drag.dy));const g=document.querySelector(`[data-v12-id="${CSS.escape(i.id)}"]`);if(g)g.setAttribute('transform',`translate(${i.x} ${i.y})`);}
function dragEnd(){if(!state.drag)return;state.drag=null;save();render();}

async function toggleFullscreen(){const card=document.querySelector('.tb-board-card');if(!card)return;try{if(document.fullscreenElement)await document.exitFullscreen();else await card.requestFullscreen();}catch(e){console.warn('Fullscreen indisponível',e);}}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}
async function exportPNG(){
  const board=$('#tbBoard'),s=scenario();if(!board||!s)return;const btn=$('#tbExportPng');if(btn)btn.disabled=true;
  try{const size=1400,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d');ctx.fillStyle='#02060b';ctx.fillRect(0,0,size,size);const map=await loadImage(MAP_LOCAL);ctx.drawImage(map,0,0,size,size);const clone=board.cloneNode(true);clone.setAttribute('xmlns',SVG_NS);clone.querySelector('#tbMapImage')?.remove();const base=[...clone.children].find(n=>n.tagName?.toLowerCase()==='rect'&&n.getAttribute('width')==='1000'&&n.getAttribute('height')==='1000');base?.remove();clone.querySelectorAll('image').forEach(im=>{const href=im.getAttribute('href')||im.getAttribute('xlink:href')||'';if(href&&!href.startsWith('data:'))im.remove();});const xml=new XMLSerializer().serializeToString(clone);const blob=new Blob([xml],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);const overlay=await loadImage(url);ctx.drawImage(overlay,0,0,size,size);URL.revokeObjectURL(url);canvas.toBlob(out=>{if(!out)return;const a=document.createElement('a');a.href=URL.createObjectURL(out);a.download=`FROMBOS-TACTICAL-${String(s.name||'CENARIO').replace(/[^a-z0-9]+/gi,'-')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},'image/png');}catch(e){console.error(e);window.alert('Não foi possível exportar a imagem deste cenário.');}finally{if(btn)btn.disabled=false;}
}

function pathMarkup(p){if(p.type==='free')return`<polyline points="${(p.points||[]).map(q=>`${q.x},${q.y}`).join(' ')}" fill="none" stroke="${esc(p.color||'#53d4ff')}" stroke-width="${Number(p.width)||7}" stroke-linecap="round" stroke-linejoin="round"/>`;if(p.type==='arrow')return`<line x1="${p.a?.x||0}" y1="${p.a?.y||0}" x2="${p.b?.x||0}" y2="${p.b?.y||0}" stroke="${esc(p.color||'#53d4ff')}" stroke-width="${Number(p.width)||9}"/>`;if(p.type==='zone')return`<ellipse cx="${p.c?.x||0}" cy="${p.c?.y||0}" rx="${p.rx||0}" ry="${p.ry||0}" fill="${esc(p.color||'#53d4ff')}" fill-opacity=".12" stroke="${esc(p.color||'#53d4ff')}" stroke-width="5" stroke-dasharray="14 10"/>`;return'';}
function markerMarkup(m){if(m.type==='champion'){const c=color(m.team);return`<g transform="translate(${m.x} ${m.y})"><circle r="25" fill="#06101d" stroke="${c}" stroke-width="4"/><text y="5" text-anchor="middle" fill="#fff" font-size="12" font-weight="900">${esc(String(m.label||'?').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase())}</text></g>`;}if(['ward','control'].includes(m.type)){const c=m.type==='control'?'#ff5364':'#f0c97a';return`<g transform="translate(${m.x} ${m.y})"><circle r="18" fill="#061017" stroke="${c}" stroke-width="3"/><circle r="5" fill="${c}"/></g>`;}if(m.type==='objective')return`<g transform="translate(${m.x} ${m.y})"><circle r="22" fill="#302512" stroke="#e0b766" stroke-width="4"/><text y="5" text-anchor="middle" fill="#f0cf8d" font-size="10" font-weight="900">OBJ</text></g>`;if(m.type==='danger')return`<g transform="translate(${m.x} ${m.y})"><circle r="20" fill="#3c1117" stroke="#ff667d" stroke-width="3"/><text y="7" text-anchor="middle" fill="#fff" font-size="18" font-weight="900">!</text></g>`;if(m.type==='text')return`<text x="${m.x}" y="${m.y}" fill="#fff" font-size="13" font-weight="800">${esc(String(m.label||'').slice(0,25))}</text>`;return'';}
function v12Markup(i){if(i.type==='wave'){const c=color(i.team);return`<g transform="translate(${i.x} ${i.y})"><circle cx="-14" cy="4" r="8" fill="${c}"/><circle cy="-6" r="9" fill="${c}"/><circle cx="14" cy="4" r="8" fill="${c}"/></g>`;}const rem=remaining(i);return`<g transform="translate(${i.x} ${i.y})"><circle r="27" fill="#050912" stroke="#f0c97a" stroke-width="3"/><text y="5" text-anchor="middle" fill="#f6dfaa" font-size="11" font-weight="900">${formatDuration(rem)}</text></g>`;}
function snapshot(s){const body=(s.paths||[]).map(pathMarkup).join('')+(s.markers||[]).map(markerMarkup).join('')+items(s).map(v12Markup).join('');return`<div class="tb-compare-card"><div class="tb-compare-title"><strong>${esc(s.name)}</strong><span>${(s.markers||[]).length} peças · ${(s.paths||[]).length} desenhos · ${items(s).length} V12</span></div><svg viewBox="0 0 1000 1000"><image href="${MAP_LOCAL}" x="0" y="0" width="1000" height="1000" preserveAspectRatio="xMidYMid meet"/>${body}</svg></div>`;}
function openCompare(){ensureCompareModal();const list=allScenarios(),a=$('#tbCompareA'),b=$('#tbCompareB');const opts=list.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');a.innerHTML=opts;b.innerHTML=opts;const idx=Math.max(0,list.findIndex(s=>s.id===scenario()?.id));a.selectedIndex=idx;b.selectedIndex=list.length>1?(idx+1)%list.length:idx;renderCompare();$('#tbCompareModal').hidden=false;}
function renderCompare(){const list=allScenarios(),sa=list.find(s=>s.id===$('#tbCompareA')?.value)||list[0],sb=list.find(s=>s.id===$('#tbCompareB')?.value)||list[0];if($('#tbCompareGrid'))$('#tbCompareGrid').innerHTML=(sa?snapshot(sa):'')+(sb?snapshot(sb):'');}

function keyboard(e){if(!location.hash.startsWith('#/tactical')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(e.key==='Escape'){state.mode=null;state.selectedId=null;$$('[data-v12-tool]').forEach(b=>b.classList.remove('active'));render();return;}if((e.key==='Delete'||e.key==='Backspace')&&state.selectedId){e.preventDefault();deleteSelected();}}
function apply(){if(!location.hash.startsWith('#/tactical'))return;ensureToolbar();ensureActions();ensureOverlay();ensurePanel();ensureCompareModal();render();}
function schedule(){cancelAnimationFrame(state.raf);state.raf=requestAnimationFrame(apply);}

document.addEventListener('pointerdown',placeItem,true);document.addEventListener('pointerdown',dragStart,true);document.addEventListener('pointermove',dragMove,true);document.addEventListener('pointerup',dragEnd,true);document.addEventListener('pointercancel',dragEnd,true);document.addEventListener('click',selectItem,true);document.addEventListener('keydown',keyboard,true);
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',()=>{state.mode=null;state.selectedId=null;schedule();});setInterval(()=>{if(location.hash.startsWith('#/tactical')&&items().some(i=>i.type==='timer'&&i.running))render();},500);schedule();
