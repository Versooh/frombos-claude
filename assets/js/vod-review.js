import { store } from './store.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>`${String(Math.floor((s||0)/60)).padStart(2,'0')}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone=v=>JSON.parse(JSON.stringify(v));
const runtime={url:null,fileName:'',currentTime:0,playbackRate:1,strokes:[],undo:[],redo:[],activeNoteId:null};

function ensure(){
  let changed=false;const s=store.state;
  if(!s.vod||typeof s.vod!=='object'){s.vod={};changed=true;}
  if(!Array.isArray(s.vod.reviews)){s.vod.reviews=[];changed=true;}
  if(!Array.isArray(s.vod.sessions)){s.vod.sessions=[];changed=true;}
  if(changed)store.save();
}
function timelineHTML(){
  const notes=[...(store.state.vod.reviews||[])].sort((a,b)=>a.time-b.time);
  return notes.length?notes.map(n=>`<button class="vod-note-card ${runtime.activeNoteId===n.id?'active':''}" data-vod-id="${esc(n.id)}"><span>${fmt(n.time)}</span><b>${esc(n.category||'Nota')}</b><p>${esc(n.note)}</p>${n.hasDrawing?'<small>quadro salvo · clique para restaurar</small>':''}</button>`).join(''):'<div class="empty">Abra um VOD e marque decisões importantes.</div>';
}
export function vodReviewHTML(){
  ensure();const notes=store.state.vod.reviews||[];
  return `<div class="vod-pro"><div class="card vod-command"><div><div class="eyebrow">LOCAL REVIEW</div><h3>Player + quadro tático</h3><p class="muted">O vídeo permanece no dispositivo. Desenhos e comentários são armazenados como análise local por timestamp.</p><div class="vod-local-file" id="vodLocalFile">${runtime.fileName?`VOD ativo: <b>${esc(runtime.fileName)}</b>`:'Nenhum arquivo local aberto.'}</div></div><div class="top-actions"><label class="btn primary">Abrir VOD<input id="vodFile" type="file" accept="video/*" hidden></label><button class="btn" id="vodUndo">↶ Desfazer</button><button class="btn" id="vodRedo">↷ Refazer</button><button class="btn" id="vodClearDraw">Limpar desenho</button><button class="btn" id="vodCapture">Salvar quadro</button></div></div>
  <div class="vod-layout"><section class="card"><div class="vod-player-stage" id="vodStage"><video id="vodVideo" controls playsinline></video><canvas id="vodDraw"></canvas></div><div class="vod-tools"><button class="btn active" data-vtool="pen">✎ Caneta</button><button class="btn" data-vtool="arrow">➜ Seta</button><button class="btn" data-vtool="circle">◯ Círculo</button><button class="btn" data-vtool="eraser">⌫ Borracha por traço</button><input id="vodColor" type="color" value="#f0c97a"><label>Velocidade<select class="select" id="vodSpeed"><option>.5</option><option ${runtime.playbackRate===1?'selected':''}>1</option><option ${runtime.playbackRate===1.25?'selected':''}>1.25</option><option ${runtime.playbackRate===1.5?'selected':''}>1.5</option><option ${runtime.playbackRate===2?'selected':''}>2</option></select></label></div><div class="vod-note-entry"><select class="select" id="vodCategory"><option>Macro</option><option>Visão</option><option>Draft</option><option>Objetivo</option><option>Comunicação</option><option>Mecânica</option><option>Erro</option><option>Boa execução</option></select><input class="input" id="vodNote" placeholder="O que aconteceu neste momento?"><button class="btn primary" id="vodSaveNote">Marcar timestamp</button></div><p class="muted vod-help">Ao desenhar, o vídeo pausa. A borracha remove o traço mais próximo. Um timestamp com quadro salvo restaura desenho + posição do vídeo.</p></section>
  <aside class="card vod-timeline"><div class="section-title"><div><div class="eyebrow">TIMELINE</div><h3>Anotações</h3></div><span class="badge blue">${notes.length}</span></div><div id="vodNotes">${timelineHTML()}</div></aside></div></div>`;
}

export function bindVodReview(rerender){
  ensure();
  const video=document.querySelector('#vodVideo'),canvas=document.querySelector('#vodDraw'),stage=document.querySelector('#vodStage');if(!video||!canvas||!stage)return;
  const ctx=canvas.getContext('2d');let tool='pen',down=false,current=null;
  const strokes=()=>runtime.strokes;
  const setStrokes=next=>{runtime.strokes=clone(next||[]);};
  const pushHistory=()=>{runtime.undo.push(clone(strokes()));if(runtime.undo.length>80)runtime.undo.shift();runtime.redo=[];};
  const canvasSize=()=>{const r=canvas.getBoundingClientRect();return{w:Math.max(1,r.width),h:Math.max(1,r.height)};};
  const pos=e=>{const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),y:Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)))};};
  const px=(p,s)=>{const {w,h}=canvasSize();return s?.space==='norm'?{x:p.x*w,y:p.y*h}:{x:p.x,y:p.y};};
  function resize(){const r=stage.getBoundingClientRect(),dpr=devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);redraw();}
  function drawStroke(s){
    ctx.strokeStyle=s.color||'#f0c97a';ctx.lineWidth=s.width||3;ctx.lineCap='round';ctx.lineJoin='round';
    if(s.type==='pen'){ctx.beginPath();(s.points||[]).forEach((p,i)=>{const q=px(p,s);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.stroke();return;}
    const a=px(s.a,s),b=px(s.b,s);
    if(s.type==='arrow'){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();const ang=Math.atan2(b.y-a.y,b.x-a.x);ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-14*Math.cos(ang-.5),b.y-14*Math.sin(ang-.5));ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-14*Math.cos(ang+.5),b.y-14*Math.sin(ang+.5));ctx.stroke();return;}
    if(s.type==='circle'){ctx.beginPath();ctx.ellipse((a.x+b.x)/2,(a.y+b.y)/2,Math.abs(b.x-a.x)/2,Math.abs(b.y-a.y)/2,0,0,Math.PI*2);ctx.stroke();}
  }
  function redraw(){ctx.clearRect(0,0,canvas.width,canvas.height);strokes().forEach(drawStroke);if(current)drawStroke(current);updateHistoryButtons();}
  function updateHistoryButtons(){const u=document.querySelector('#vodUndo'),r=document.querySelector('#vodRedo');if(u)u.disabled=!runtime.undo.length;if(r)r.disabled=!runtime.redo.length;}
  const segDist=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y;if(!dx&&!dy)return Math.hypot(p.x-a.x,p.y-a.y);const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));};
  function distanceToStroke(s,p){
    if(s.type==='pen'){const pts=(s.points||[]).map(x=>px(x,s));let best=Infinity;for(let i=1;i<pts.length;i++)best=Math.min(best,segDist(p,pts[i-1],pts[i]));return best;}
    const a=px(s.a,s),b=px(s.b,s);if(s.type==='arrow')return segDist(p,a,b);
    if(s.type==='circle'){const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,rx=Math.max(1,Math.abs(b.x-a.x)/2),ry=Math.max(1,Math.abs(b.y-a.y)/2);const q=Math.sqrt(((p.x-cx)/rx)**2+((p.y-cy)/ry)**2);return Math.abs(q-1)*Math.min(rx,ry);}
    return Infinity;
  }
  function eraseNearest(e){const r=canvas.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top};let best={i:-1,d:18};strokes().forEach((s,i)=>{const d=distanceToStroke(s,p);if(d<best.d)best={i,d};});if(best.i<0)return;pushHistory();runtime.strokes.splice(best.i,1);redraw();}
  function restoreVideo(){if(!runtime.url)return;video.src=runtime.url;video.playbackRate=runtime.playbackRate||1;video.addEventListener('loadedmetadata',()=>{video.currentTime=Math.min(runtime.currentTime||0,Number.isFinite(video.duration)?video.duration:runtime.currentTime||0);resize();},{once:true});}
  function bindTimeline(){document.querySelectorAll('[data-vod-id]').forEach(b=>b.onclick=()=>{const note=(store.state.vod.reviews||[]).find(n=>n.id===b.dataset.vodId);if(!note)return;runtime.activeNoteId=note.id;runtime.currentTime=Number(note.time)||0;if(note.drawing){pushHistory();setStrokes(note.drawing);}else{pushHistory();setStrokes([]);}if(runtime.url){video.currentTime=runtime.currentTime;video.pause();}redraw();document.querySelectorAll('[data-vod-id]').forEach(x=>x.classList.toggle('active',x.dataset.vodId===note.id));});}
  restoreVideo();
  document.querySelector('#vodFile').onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(runtime.url)URL.revokeObjectURL(runtime.url);runtime.url=URL.createObjectURL(f);runtime.fileName=f.name;runtime.currentTime=0;runtime.playbackRate=1;runtime.activeNoteId=null;runtime.undo=[];runtime.redo=[];setStrokes([]);video.src=runtime.url;video.onloadedmetadata=()=>{resize();video.currentTime=0;};const info=document.querySelector('#vodLocalFile');if(info)info.innerHTML=`VOD ativo: <b>${esc(f.name)}</b>`;redraw();};
  video.addEventListener('timeupdate',()=>runtime.currentTime=video.currentTime||0);video.addEventListener('ratechange',()=>runtime.playbackRate=video.playbackRate||1);
  document.querySelector('#vodSpeed').onchange=e=>{runtime.playbackRate=Number(e.target.value)||1;video.playbackRate=runtime.playbackRate;};
  document.querySelectorAll('[data-vtool]').forEach(b=>b.onclick=()=>{tool=b.dataset.vtool;document.querySelectorAll('[data-vtool]').forEach(x=>x.classList.toggle('active',x===b));});
  canvas.addEventListener('pointerdown',e=>{if(!video.paused)video.pause();if(tool==='eraser'){eraseNearest(e);return;}down=true;const start=pos(e),color=document.querySelector('#vodColor').value;current=tool==='pen'?{type:'pen',space:'norm',color,width:3,points:[start]}:{type:tool,space:'norm',color,width:3,a:start,b:start};canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!down||!current)return;const p=pos(e);if(current.type==='pen')current.points.push(p);else current.b=p;redraw();});
  const finish=()=>{if(!down)return;if(current){pushHistory();runtime.strokes.push(current);}current=null;down=false;redraw();};canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
  document.querySelector('#vodUndo').onclick=()=>{if(!runtime.undo.length)return;runtime.redo.push(clone(strokes()));setStrokes(runtime.undo.pop());redraw();};
  document.querySelector('#vodRedo').onclick=()=>{if(!runtime.redo.length)return;runtime.undo.push(clone(strokes()));setStrokes(runtime.redo.pop());redraw();};
  document.querySelector('#vodClearDraw').onclick=()=>{if(!strokes().length)return;pushHistory();setStrokes([]);redraw();};
  function saveNote(forceDrawing=false){const note=document.querySelector('#vodNote').value.trim();if(!note&&!forceDrawing)return;runtime.currentTime=video.currentTime||runtime.currentTime||0;const category=document.querySelector('#vodCategory').value,drawing=strokes().length?clone(strokes()):null,id=uid();store.update(s=>s.vod.reviews.push({id,time:runtime.currentTime,category,note:note||'Quadro tático',drawing,hasDrawing:!!drawing,createdAt:new Date().toISOString()}));runtime.activeNoteId=id;rerender();}
  document.querySelector('#vodSaveNote').onclick=()=>saveNote(false);document.querySelector('#vodCapture').onclick=()=>saveNote(true);
  bindTimeline();window.addEventListener('resize',resize,{once:true});requestAnimationFrame(resize);
}
