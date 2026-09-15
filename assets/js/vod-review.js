import { store } from './store.js';
import { tacticalCloudBridge } from './core/tactical-cloud-bridge.js';
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>`${String(Math.floor((s||0)/60)).padStart(2,'0')}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
function ensure(){store.update(s=>{s.vod=s.vod||{};s.vod.reviews=Array.isArray(s.vod.reviews)?s.vod.reviews:[];s.vod.sessions=Array.isArray(s.vod.sessions)?s.vod.sessions:[];});}
export function vodReviewHTML(){
 ensure();
 const notes=[...(store.state.vod.reviews||[])].sort((a,b)=>a.time-b.time);
 return `<div class="vod-pro"><div class="card vod-command"><div><div class="eyebrow">LOCAL REVIEW</div><h3>Player + quadro tático</h3><p class="muted">O vídeo permanece no dispositivo. Desenhos e comentários são armazenados como análise local por timestamp.</p></div><div class="top-actions"><label class="btn primary">Abrir VOD<input id="vodFile" type="file" accept="video/*" hidden></label><button class="btn" id="vodClearDraw">Limpar desenho</button><button class="btn" id="vodCapture">Salvar quadro</button></div></div>
 <div class="vod-layout"><section class="card"><div class="vod-player-stage" id="vodStage"><video id="vodVideo" controls playsinline></video><canvas id="vodDraw"></canvas></div><div class="vod-tools"><button class="btn" data-vtool="pen">✎ Caneta</button><button class="btn" data-vtool="arrow">➜ Seta</button><button class="btn" data-vtool="circle">◯ Círculo</button><button class="btn" data-vtool="eraser">⌫ Borracha</button><input id="vodColor" type="color" value="#f0c97a"><label>Velocidade<select class="select" id="vodSpeed"><option>.5</option><option selected>1</option><option>1.25</option><option>1.5</option><option>2</option></select></label></div><div class="vod-note-entry"><select class="select" id="vodCategory"><option>Macro</option><option>Visão</option><option>Draft</option><option>Objetivo</option><option>Comunicação</option><option>Mecânica</option><option>Erro</option><option>Boa execução</option></select><input class="input" id="vodNote" placeholder="O que aconteceu neste momento?"><button class="btn primary" id="vodSaveNote">Marcar timestamp</button></div></section>
 <aside class="card vod-timeline"><div class="section-title"><div><div class="eyebrow">TIMELINE</div><h3>Anotações</h3></div><span class="badge blue">${notes.length}</span></div><div id="vodNotes">${notes.length?notes.map(n=>`<button class="vod-note-card" data-vod-time="${n.time}"><span>${fmt(n.time)}</span><b>${esc(n.category||'Nota')}</b><p>${esc(n.note)}</p>${n.hasDrawing?'<small>quadro salvo</small>':''}</button>`).join(''):'<div class="empty">Abra um VOD e marque decisões importantes.</div>'}</div></aside></div></div>`;
}
export function bindVodReview(rerender){
 const video=document.querySelector('#vodVideo'),canvas=document.querySelector('#vodDraw'),stage=document.querySelector('#vodStage'); if(!video||!canvas)return;
 const ctx=canvas.getContext('2d'); let tool='pen',down=false,current=null,strokes=[];
 function resize(){const r=stage.getBoundingClientRect();const dpr=devicePixelRatio||1;canvas.width=Math.max(1,r.width*dpr);canvas.height=Math.max(1,r.height*dpr);canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);redraw();}
 function pos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
 function drawStroke(s){ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';if(s.type==='pen'){ctx.beginPath();s.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}else if(s.type==='arrow'){ctx.beginPath();ctx.moveTo(s.a.x,s.a.y);ctx.lineTo(s.b.x,s.b.y);ctx.stroke();const a=Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x);ctx.beginPath();ctx.moveTo(s.b.x,s.b.y);ctx.lineTo(s.b.x-14*Math.cos(a-.5),s.b.y-14*Math.sin(a-.5));ctx.moveTo(s.b.x,s.b.y);ctx.lineTo(s.b.x-14*Math.cos(a+.5),s.b.y-14*Math.sin(a+.5));ctx.stroke();}else if(s.type==='circle'){ctx.beginPath();ctx.ellipse((s.a.x+s.b.x)/2,(s.a.y+s.b.y)/2,Math.abs(s.b.x-s.a.x)/2,Math.abs(s.b.y-s.a.y)/2,0,0,Math.PI*2);ctx.stroke();}}
 function redraw(){ctx.clearRect(0,0,canvas.width,canvas.height);strokes.forEach(drawStroke);if(current)drawStroke(current);}
 document.querySelector('#vodFile').onchange=e=>{const f=e.target.files?.[0];if(!f)return;video.src=URL.createObjectURL(f);video.onloadedmetadata=resize;};
 document.querySelector('#vodSpeed').onchange=e=>video.playbackRate=Number(e.target.value)||1;
 document.querySelectorAll('[data-vtool]').forEach(b=>b.onclick=()=>{tool=b.dataset.vtool;document.querySelectorAll('[data-vtool]').forEach(x=>x.classList.toggle('active',x===b));});
 canvas.addEventListener('pointerdown',e=>{if(video.paused===false)video.pause();down=true;const start=pos(e);if(tool==='eraser'){strokes=[];redraw();down=false;return;}const color=document.querySelector('#vodColor').value;current=tool==='pen'?{type:'pen',color,points:[start]}:{type:tool,color,a:start,b:start};canvas.setPointerCapture?.(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!down||!current)return;const p=pos(e);if(current.type==='pen')current.points.push(p);else current.b=p;redraw();});
 canvas.addEventListener('pointerup',()=>{if(current)strokes.push(current);current=null;down=false;redraw();});
 document.querySelector('#vodClearDraw').onclick=()=>{strokes=[];redraw();};
 async function persistTacticalEvent(event){
   const scenarioId=store.state?.tactical?.activeScenario;
   if(!scenarioId) return;
   try{
     await tacticalCloudBridge.saveEvent(scenarioId,event);
     window.dispatchEvent(new CustomEvent('frombos:tactical-save'));
   }catch(error){console.warn('[FROMBOS] VOD tactical event save failed:',error);}
 }
 function saveNote(forceDrawing=false){
   const note=document.querySelector('#vodNote').value.trim();if(!note&&!forceDrawing)return;
   const t=video.currentTime||0;const category=document.querySelector('#vodCategory').value;const drawing=strokes.length?strokes:null;
   const eventId=uid();
   const review={id:eventId,time:t,category,note:note||'Quadro tático',drawing,hasDrawing:!!drawing,createdAt:new Date().toISOString()};
   store.update(s=>s.vod.reviews.push(review));
   persistTacticalEvent({id:eventId,timestamp:Math.round(t),vodTimestampSeconds:Math.round(t),type:category==='Erro'?'mistake':category==='Objetivo'?'objective':category==='Visão'?'vision':category==='Macro'?'decision':'note',title:category,note:review.note,severity:category==='Erro'?'warning':'info',tags:[category],vodId:store.state?.vod?.activeVodId||null});
   rerender();
 }
 document.querySelector('#vodSaveNote').onclick=()=>saveNote(false);document.querySelector('#vodCapture').onclick=()=>saveNote(true);
 document.querySelectorAll('[data-vod-time]').forEach(b=>b.onclick=()=>{video.currentTime=Number(b.dataset.vodTime)||0;video.pause();});
 window.addEventListener('resize',resize,{once:true});requestAnimationFrame(resize);
}
