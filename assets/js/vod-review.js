// FROMBOS VOD REVIEW V14 — análise local, timestamped evidence and report export.
import { store } from './store.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>`${String(Math.floor((s||0)/60)).padStart(2,'0')}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone=v=>JSON.parse(JSON.stringify(v));
const safeName=v=>String(v||'vod-review').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-_]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase()||'vod-review';
const CATEGORIES=['Macro','Visão','Draft','Objetivo','Comunicação','Mecânica','Erro','Boa execução'];
const ROLE_LABEL={BARON:'Barão',JUNGLE:'Selva',MID:'Meio',DUO:'Duo',SUPPORT:'Suporte'};
const runtime={url:null,sessionId:null,fileName:'',currentTime:0,playbackRate:1,strokes:[],undo:[],redo:[],activeNoteId:null,tool:'player'};

function ensure(){
  let changed=false;const s=store.state;
  if(!s.vod||typeof s.vod!=='object'){s.vod={};changed=true;}
  if(!Array.isArray(s.vod.reviews)){s.vod.reviews=[];changed=true;}
  if(!Array.isArray(s.vod.sessions)){s.vod.sessions=[];changed=true;}
  if(!('activeSessionId' in s.vod)){s.vod.activeSessionId=null;changed=true;}
  const legacy=s.vod.reviews.filter(n=>!n.sessionId);
  if(legacy.length){
    let session=s.vod.sessions.find(x=>x.legacyRecovered);
    if(!session){session={id:uid(),title:'Análise recuperada',fileName:'',opponent:s.team?.opponent||'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),legacyRecovered:true};s.vod.sessions.push(session);}
    legacy.forEach(n=>n.sessionId=session.id);if(!s.vod.activeSessionId)s.vod.activeSessionId=session.id;changed=true;
  }
  if(s.vod.activeSessionId&&!s.vod.sessions.some(x=>x.id===s.vod.activeSessionId)){s.vod.activeSessionId=s.vod.sessions.at(-1)?.id||null;changed=true;}
  if(changed)store.save();
}
function activeSession(){ensure();return store.state.vod.sessions.find(x=>x.id===store.state.vod.activeSessionId)||null;}
function sessionNotes(sessionId=activeSession()?.id){return sessionId?(store.state.vod.reviews||[]).filter(n=>n.sessionId===sessionId):[];}
function playerOptions(selected='TEAM'){
  const entries=Object.entries(store.state.team?.players||{});
  return [`<option value="TEAM" ${selected==='TEAM'?'selected':''}>Equipe / Geral</option>`,...entries.map(([role,p])=>`<option value="${esc(role)}" ${selected===role?'selected':''}>${esc(ROLE_LABEL[role]||role)}${p?.name?` · ${esc(p.name)}`:''}</option>`)].join('');
}
function playerLabel(value){if(!value||value==='TEAM')return'Equipe / Geral';const p=store.state.team?.players?.[value];return`${ROLE_LABEL[value]||value}${p?.name?` · ${p.name}`:''}`;}
function downloadBlob(name,content,type='text/html'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
function downloadDataURL(name,url){const a=document.createElement('a');a.href=url;a.download=name;a.click();}
function newSession(title='Nova análise',fileName=''){
  const session={id:uid(),title:title||'Nova análise',fileName,opponent:store.state.team?.opponent||'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  store.update(s=>{s.vod.sessions.push(session);s.vod.activeSessionId=session.id;});return session;
}
function sessionOptions(){const sessions=store.state.vod.sessions||[];const active=activeSession();return sessions.length?sessions.slice().reverse().map(s=>`<option value="${esc(s.id)}" ${s.id===active?.id?'selected':''}>${esc(s.title)}${s.fileName?` · ${esc(s.fileName)}`:''}</option>`).join(''):'<option value="">Nenhuma análise criada</option>';}
function noteMatches(n,filters={}){const q=(filters.q||'').trim().toLowerCase();if(filters.category&&n.category!==filters.category)return false;if(filters.player&&n.player!==filters.player)return false;if(q&&!`${n.note||''} ${n.category||''} ${playerLabel(n.player)}`.toLowerCase().includes(q))return false;return true;}
function timelineHTML(filters={}){
  const notes=[...sessionNotes()].filter(n=>noteMatches(n,filters)).sort((a,b)=>a.time-b.time);
  return notes.length?notes.map(n=>`<article class="vod-note-card ${runtime.activeNoteId===n.id?'active':''}" data-vod-card="${esc(n.id)}"><button class="vod-note-main" data-vod-id="${esc(n.id)}"><div class="vod-note-meta"><span>${fmt(n.time)}</span><b>${esc(n.category||'Nota')}</b><em>${esc(playerLabel(n.player))}</em></div>${n.snapshot?`<img class="vod-note-thumb" src="${n.snapshot}" alt="Quadro anotado em ${fmt(n.time)}">`:''}<p>${esc(n.note)}</p>${n.hasDrawing?'<small>desenho salvo · clique para restaurar</small>':''}</button><div class="vod-note-actions">${n.snapshot?`<button class="btn" data-vod-shot="${esc(n.id)}">Imagem</button>`:''}<button class="btn danger-outline" data-vod-delete="${esc(n.id)}">Excluir</button></div></article>`).join(''):'<div class="empty">Nenhuma anotação corresponde aos filtros desta análise.</div>';
}
function categoryOptions(value=''){return`<option value="">Todas as categorias</option>${CATEGORIES.map(x=>`<option value="${esc(x)}" ${x===value?'selected':''}>${esc(x)}</option>`).join('')}`;}
function reviewStats(notes){const counts={};notes.forEach(n=>counts[n.category]=(counts[n.category]||0)+1);return Object.entries(counts).sort((a,b)=>b[1]-a[1]);}
function reportHTML(session,notes){
  const stats=reviewStats(notes),created=session?.createdAt?new Date(session.createdAt).toLocaleString('pt-BR'):'—';
  const rows=[...notes].sort((a,b)=>a.time-b.time).map(n=>`<article><header><strong>${fmt(n.time)} · ${esc(n.category||'Nota')}</strong><span>${esc(playerLabel(n.player))}</span></header><p>${esc(n.note||'Quadro tático')}</p>${n.snapshot?`<img src="${n.snapshot}" alt="Evidência visual em ${fmt(n.time)}">`:''}</article>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(session?.title||'Relatório VOD')}</title><style>body{margin:0;background:#070b16;color:#e8edf7;font-family:Arial,sans-serif}.wrap{max-width:980px;margin:auto;padding:32px}.head{border-bottom:1px solid #26334d;padding-bottom:20px}.ey{color:#f0c97a;font-size:11px;letter-spacing:.18em;font-weight:800}h1{margin:8px 0 10px;font-size:36px}.meta,.stats{display:flex;gap:10px;flex-wrap:wrap}.meta span,.stats span{border:1px solid #2a3954;border-radius:999px;padding:7px 10px;color:#aebbd0;font-size:12px}.stats{margin:20px 0}.stats b{color:#fff}article{border:1px solid #26334d;background:#0c1426;border-radius:12px;padding:16px;margin:12px 0}article header{display:flex;justify-content:space-between;gap:12px;color:#f0c97a}article header span{color:#65d8ff;font-size:12px}article p{line-height:1.55;color:#d6dfef}article img{display:block;max-width:100%;border-radius:8px;border:1px solid #2b3b58;margin-top:12px}.foot{color:#7888a4;font-size:11px;margin-top:24px}</style></head><body><main class="wrap"><section class="head"><div class="ey">FROMBOS · VOD REVIEW V14</div><h1>${esc(session?.title||'Revisão de VOD')}</h1><div class="meta"><span>Adversário: ${esc(session?.opponent||'Não informado')}</span><span>Arquivo: ${esc(session?.fileName||'Arquivo local')}</span><span>Criada: ${created}</span><span>Anotações: ${notes.length}</span></div></section><div class="stats">${stats.length?stats.map(([k,v])=>`<span><b>${v}</b> ${esc(k)}</span>`).join(''):'<span>Sem anotações</span>'}</div>${rows||'<p>Sem anotações registradas.</p>'}<p class="foot">Relatório gerado localmente pelo FROMBOS. As observações refletem anotações da equipe e não representam estatísticas observadas ou probabilidade de vitória.</p></main></body></html>`;
}

export function vodReviewHTML(){
  ensure();const session=activeSession(),notes=sessionNotes(),loaded=Boolean(runtime.url&&runtime.sessionId===session?.id),fileStatus=loaded?`VOD ativo: <b>${esc(runtime.fileName)}</b>`:session?.fileName?`Sessão vinculada a <b>${esc(session.fileName)}</b>. Reabra o arquivo local para reproduzir.`:'Nenhum arquivo local aberto nesta análise.';
  return `<div class="vod-pro"><div class="card vod-command"><div><div class="eyebrow">VOD REVIEW V14 · LOCAL</div><h3>Player + quadro congelado + evidência visual</h3><p class="muted">O vídeo nunca sai do dispositivo. Sessões, desenhos, timestamps e relatórios ficam no workspace local.</p><div class="vod-local-file" id="vodLocalFile">${fileStatus}</div></div><div class="top-actions"><button class="btn" id="vodNewSession">＋ Nova análise</button><label class="btn primary">Abrir VOD<input id="vodFile" type="file" accept="video/*" hidden></label><button class="btn" id="vodExportReport" ${!session?'disabled':''}>Exportar relatório</button></div></div>
  <div class="card vod-session-strip"><label>Análise<select class="select" id="vodSessionSelect" ${!store.state.vod.sessions.length?'disabled':''}>${sessionOptions()}</select></label><label>Título<input class="input" id="vodSessionTitle" value="${esc(session?.title||'')}" placeholder="Ex.: Scrim vs adversário" ${!session?'disabled':''}></label><label>Adversário<input class="input" id="vodSessionOpponent" value="${esc(session?.opponent||store.state.team?.opponent||'')}" ${!session?'disabled':''}></label><div class="vod-session-kpi"><small>ANOTAÇÕES</small><b>${notes.length}</b></div></div>
  <div class="vod-layout"><section class="card"><div class="vod-player-stage ${runtime.tool!=='player'?'drawing-mode':''}" id="vodStage"><video id="vodVideo" controls playsinline></video><canvas id="vodDraw"></canvas><div class="vod-freeze-badge" id="vodFreezeBadge">QUADRO DE ANÁLISE</div></div>
  <div class="vod-transport"><button class="btn" id="vodFreeze">⏸ Congelar / Retomar</button><button class="btn" id="vodStepBack">−33 ms</button><button class="btn" id="vodStepForward">+33 ms</button><button class="btn" id="vodFullscreen">⛶ Tela cheia</button><button class="btn" id="vodDownloadFrame">⇩ Baixar quadro</button><label>Velocidade<select class="select" id="vodSpeed"><option value="0.5">0.5×</option><option value="1" ${runtime.playbackRate===1?'selected':''}>1×</option><option value="1.25" ${runtime.playbackRate===1.25?'selected':''}>1.25×</option><option value="1.5" ${runtime.playbackRate===1.5?'selected':''}>1.5×</option><option value="2" ${runtime.playbackRate===2?'selected':''}>2×</option></select></label></div>
  <div class="vod-tools"><button class="btn ${runtime.tool==='player'?'active':''}" data-vtool="player">▶ Player</button><button class="btn ${runtime.tool==='pen'?'active':''}" data-vtool="pen">✎ Caneta</button><button class="btn ${runtime.tool==='arrow'?'active':''}" data-vtool="arrow">➜ Seta</button><button class="btn ${runtime.tool==='circle'?'active':''}" data-vtool="circle">◯ Círculo</button><button class="btn ${runtime.tool==='eraser'?'active':''}" data-vtool="eraser">⌫ Borracha</button><input id="vodColor" type="color" value="#f0c97a"><label>Espessura<select class="select" id="vodWidth"><option>2</option><option selected>3</option><option>5</option><option>8</option></select></label><button class="btn" id="vodUndo">↶</button><button class="btn" id="vodRedo">↷</button><button class="btn" id="vodClearDraw">Limpar</button></div>
  <div class="vod-note-entry"><select class="select" id="vodPlayer">${playerOptions()}</select><select class="select" id="vodCategory">${CATEGORIES.map(x=>`<option>${esc(x)}</option>`).join('')}</select><input class="input" id="vodNote" placeholder="O que aconteceu neste momento?"><button class="btn primary" id="vodSaveNote">Marcar timestamp</button><button class="btn info" id="vodCapture">Salvar quadro + imagem</button></div><p class="muted vod-help">Selecione uma ferramenta de desenho para pausar e anotar. “Player” devolve os controles nativos do vídeo. Os botões ±33 ms fazem microajuste temporal e não presumem o FPS real do arquivo.</p></section>
  <aside class="card vod-timeline"><div class="section-title"><div><div class="eyebrow">TIMELINE DA ANÁLISE</div><h3>Comentários e quadros</h3></div><span class="badge blue">${notes.length}</span></div><div class="vod-filters"><input class="input" id="vodFilterSearch" placeholder="Buscar anotação..."><select class="select" id="vodFilterCategory">${categoryOptions()}</select><select class="select" id="vodFilterPlayer"><option value="">Todos os jogadores</option>${playerOptions().replace('<option value="TEAM" >Equipe / Geral</option>','<option value="TEAM">Equipe / Geral</option>')}</select></div><div id="vodNotes">${timelineHTML()}</div></aside></div></div>`;
}

export function bindVodReview(rerender){
  ensure();
  const video=document.querySelector('#vodVideo'),canvas=document.querySelector('#vodDraw'),stage=document.querySelector('#vodStage');if(!video||!canvas||!stage)return;
  const ctx=canvas.getContext('2d');let down=false,current=null;
  const strokes=()=>runtime.strokes;
  const setStrokes=next=>{runtime.strokes=clone(next||[]);};
  const pushHistory=()=>{runtime.undo.push(clone(strokes()));if(runtime.undo.length>80)runtime.undo.shift();runtime.redo=[];};
  const canvasSize=()=>{const r=canvas.getBoundingClientRect();return{w:Math.max(1,r.width),h:Math.max(1,r.height)};};
  const pos=e=>{const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),y:Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height)))};};
  const px=(p,w,h,s)=>s?.space==='norm'?{x:p.x*w,y:p.y*h}:{x:p.x,y:p.y};
  function drawStrokeOn(target,s,w,h){
    target.strokeStyle=s.color||'#f0c97a';target.lineWidth=s.width||3;target.lineCap='round';target.lineJoin='round';
    if(s.type==='pen'){target.beginPath();(s.points||[]).forEach((p,i)=>{const q=px(p,w,h,s);i?target.lineTo(q.x,q.y):target.moveTo(q.x,q.y);});target.stroke();return;}
    const a=px(s.a,w,h,s),b=px(s.b,w,h,s);
    if(s.type==='arrow'){target.beginPath();target.moveTo(a.x,a.y);target.lineTo(b.x,b.y);target.stroke();const ang=Math.atan2(b.y-a.y,b.x-a.x);target.beginPath();target.moveTo(b.x,b.y);target.lineTo(b.x-14*Math.cos(ang-.5),b.y-14*Math.sin(ang-.5));target.moveTo(b.x,b.y);target.lineTo(b.x-14*Math.cos(ang+.5),b.y-14*Math.sin(ang+.5));target.stroke();return;}
    if(s.type==='circle'){target.beginPath();target.ellipse((a.x+b.x)/2,(a.y+b.y)/2,Math.abs(b.x-a.x)/2,Math.abs(b.y-a.y)/2,0,0,Math.PI*2);target.stroke();}
  }
  function resize(){const r=stage.getBoundingClientRect(),dpr=devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);redraw();}
  function redraw(){const {w,h}=canvasSize();ctx.clearRect(0,0,w,h);strokes().forEach(s=>drawStrokeOn(ctx,s,w,h));if(current)drawStrokeOn(ctx,current,w,h);updateHistoryButtons();}
  function updateHistoryButtons(){const u=document.querySelector('#vodUndo'),r=document.querySelector('#vodRedo');if(u)u.disabled=!runtime.undo.length;if(r)r.disabled=!runtime.redo.length;}
  const segDist=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y;if(!dx&&!dy)return Math.hypot(p.x-a.x,p.y-a.y);const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));};
  function distanceToStroke(s,p){const {w,h}=canvasSize();if(s.type==='pen'){const pts=(s.points||[]).map(x=>px(x,w,h,s));let best=Infinity;for(let i=1;i<pts.length;i++)best=Math.min(best,segDist(p,pts[i-1],pts[i]));return best;}const a=px(s.a,w,h,s),b=px(s.b,w,h,s);if(s.type==='arrow')return segDist(p,a,b);if(s.type==='circle'){const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,rx=Math.max(1,Math.abs(b.x-a.x)/2),ry=Math.max(1,Math.abs(b.y-a.y)/2);const q=Math.sqrt(((p.x-cx)/rx)**2+((p.y-cy)/ry)**2);return Math.abs(q-1)*Math.min(rx,ry);}return Infinity;}
  function eraseNearest(e){const r=canvas.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top};let best={i:-1,d:18};strokes().forEach((s,i)=>{const d=distanceToStroke(s,p);if(d<best.d)best={i,d};});if(best.i<0)return;pushHistory();runtime.strokes.splice(best.i,1);redraw();}
  function setTool(tool){runtime.tool=tool;stage.classList.toggle('drawing-mode',tool!=='player');document.querySelectorAll('[data-vtool]').forEach(x=>x.classList.toggle('active',x.dataset.vtool===tool));}
  function restoreVideo(){const session=activeSession();if(!runtime.url||runtime.sessionId!==session?.id)return;video.src=runtime.url;video.playbackRate=runtime.playbackRate||1;video.addEventListener('loadedmetadata',()=>{video.currentTime=Math.min(runtime.currentTime||0,Number.isFinite(video.duration)?video.duration:runtime.currentTime||0);resize();},{once:true});}
  function captureSnapshot(){
    if(!video.videoWidth||!video.videoHeight)return null;
    try{const r=stage.getBoundingClientRect(),w=960,h=Math.max(1,Math.round(w*(r.height/Math.max(1,r.width)))),out=document.createElement('canvas');out.width=w;out.height=h;const c=out.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,w,h);const vr=video.videoWidth/video.videoHeight,tr=w/h;let dw,dh;if(vr>tr){dw=w;dh=w/vr;}else{dh=h;dw=h*vr;}const dx=(w-dw)/2,dy=(h-dh)/2;c.drawImage(video,dx,dy,dw,dh);strokes().forEach(s=>drawStrokeOn(c,s,w,h));return out.toDataURL('image/jpeg',.78);}catch(err){console.warn('Falha ao capturar quadro',err);return null;}
  }
  function currentFilters(){return{q:document.querySelector('#vodFilterSearch')?.value||'',category:document.querySelector('#vodFilterCategory')?.value||'',player:document.querySelector('#vodFilterPlayer')?.value||''};}
  function bindTimeline(){
    document.querySelectorAll('[data-vod-id]').forEach(b=>b.onclick=()=>{const note=(store.state.vod.reviews||[]).find(n=>n.id===b.dataset.vodId);if(!note)return;runtime.activeNoteId=note.id;runtime.currentTime=Number(note.time)||0;pushHistory();setStrokes(note.drawing||[]);if(runtime.url&&runtime.sessionId===note.sessionId){video.currentTime=runtime.currentTime;video.pause();}redraw();document.querySelectorAll('[data-vod-card]').forEach(x=>x.classList.toggle('active',x.dataset.vodCard===note.id));});
    document.querySelectorAll('[data-vod-shot]').forEach(b=>b.onclick=()=>{const note=(store.state.vod.reviews||[]).find(n=>n.id===b.dataset.vodShot);if(note?.snapshot)downloadDataURL(`FROMBOS-${fmt(note.time).replace(':','-')}.jpg`,note.snapshot);});
    document.querySelectorAll('[data-vod-delete]').forEach(b=>b.onclick=()=>{if(!confirm('Excluir esta anotação?'))return;store.update(s=>s.vod.reviews=s.vod.reviews.filter(n=>n.id!==b.dataset.vodDelete));if(runtime.activeNoteId===b.dataset.vodDelete)runtime.activeNoteId=null;renderTimeline();});
  }
  function renderTimeline(){const host=document.querySelector('#vodNotes');if(!host)return;host.innerHTML=timelineHTML(currentFilters());bindTimeline();}
  restoreVideo();setTool(runtime.tool);requestAnimationFrame(resize);
  document.querySelector('#vodNewSession').onclick=()=>{const title=prompt('Nome da nova análise:','Nova análise de VOD');if(!title)return;newSession(title);runtime.activeNoteId=null;runtime.sessionId=null;runtime.currentTime=0;setStrokes([]);rerender();};
  document.querySelector('#vodSessionSelect')?.addEventListener('change',e=>{store.update(s=>s.vod.activeSessionId=e.target.value||null);runtime.activeNoteId=null;runtime.currentTime=0;setStrokes([]);rerender();});
  document.querySelector('#vodSessionTitle')?.addEventListener('change',e=>{const id=activeSession()?.id;if(!id)return;store.update(s=>{const x=s.vod.sessions.find(v=>v.id===id);if(x){x.title=e.target.value.trim()||'Análise de VOD';x.updatedAt=new Date().toISOString();}});});
  document.querySelector('#vodSessionOpponent')?.addEventListener('change',e=>{const id=activeSession()?.id;if(!id)return;store.update(s=>{const x=s.vod.sessions.find(v=>v.id===id);if(x){x.opponent=e.target.value.trim();x.updatedAt=new Date().toISOString();}});});
  document.querySelector('#vodFile').onchange=e=>{const f=e.target.files?.[0];if(!f)return;let session=activeSession();if(!session||(session.fileName&&session.fileName!==f.name)){session=newSession(f.name.replace(/\.[^.]+$/,''),f.name);}else{store.update(s=>{const x=s.vod.sessions.find(v=>v.id===session.id);if(x){x.fileName=f.name;x.updatedAt=new Date().toISOString();}});}if(runtime.url)URL.revokeObjectURL(runtime.url);runtime.url=URL.createObjectURL(f);runtime.sessionId=session.id;runtime.fileName=f.name;runtime.currentTime=0;runtime.playbackRate=1;runtime.activeNoteId=null;runtime.undo=[];runtime.redo=[];setStrokes([]);rerender();};
  video.addEventListener('timeupdate',()=>runtime.currentTime=video.currentTime||0);video.addEventListener('ratechange',()=>runtime.playbackRate=video.playbackRate||1);video.addEventListener('play',()=>document.querySelector('#vodFreezeBadge')?.classList.remove('show'));video.addEventListener('pause',()=>document.querySelector('#vodFreezeBadge')?.classList.add('show'));
  document.querySelector('#vodSpeed').onchange=e=>{runtime.playbackRate=Number(e.target.value)||1;video.playbackRate=runtime.playbackRate;};
  document.querySelector('#vodFreeze').onclick=()=>{if(video.paused)video.play().catch(()=>{});else video.pause();};
  const step=delta=>{video.pause();const duration=Number.isFinite(video.duration)?video.duration:Infinity;video.currentTime=Math.max(0,Math.min(duration,(video.currentTime||0)+delta));runtime.currentTime=video.currentTime;};
  document.querySelector('#vodStepBack').onclick=()=>step(-.033);document.querySelector('#vodStepForward').onclick=()=>step(.033);
  document.querySelector('#vodFullscreen').onclick=()=>stage.requestFullscreen?.();
  document.querySelector('#vodDownloadFrame').onclick=()=>{const shot=captureSnapshot();if(!shot)return alert('Abra um VOD e aguarde o primeiro quadro antes de exportar.');downloadDataURL(`FROMBOS-QUADRO-${fmt(video.currentTime).replace(':','-')}.jpg`,shot);};
  document.querySelectorAll('[data-vtool]').forEach(b=>b.onclick=()=>setTool(b.dataset.vtool));
  canvas.addEventListener('pointerdown',e=>{if(runtime.tool==='player')return;if(!video.paused)video.pause();if(runtime.tool==='eraser'){eraseNearest(e);return;}down=true;const start=pos(e),color=document.querySelector('#vodColor').value,width=Number(document.querySelector('#vodWidth')?.value)||3;current=runtime.tool==='pen'?{type:'pen',space:'norm',color,width,points:[start]}:{type:runtime.tool,space:'norm',color,width,a:start,b:start};canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!down||!current)return;const p=pos(e);if(current.type==='pen')current.points.push(p);else current.b=p;redraw();});
  const finish=()=>{if(!down)return;if(current){pushHistory();runtime.strokes.push(current);}current=null;down=false;redraw();};canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
  document.querySelector('#vodUndo').onclick=()=>{if(!runtime.undo.length)return;runtime.redo.push(clone(strokes()));setStrokes(runtime.undo.pop());redraw();};
  document.querySelector('#vodRedo').onclick=()=>{if(!runtime.redo.length)return;runtime.undo.push(clone(strokes()));setStrokes(runtime.redo.pop());redraw();};
  document.querySelector('#vodClearDraw').onclick=()=>{if(!strokes().length)return;pushHistory();setStrokes([]);redraw();};
  function saveNote(includeSnapshot=false){
    let session=activeSession();if(!session){session=newSession(runtime.fileName?runtime.fileName.replace(/\.[^.]+$/,''):'Nova análise',runtime.fileName);runtime.sessionId=runtime.url?session.id:null;}
    const note=document.querySelector('#vodNote').value.trim();if(!note&&!includeSnapshot)return;runtime.currentTime=video.currentTime||runtime.currentTime||0;const drawing=strokes().length?clone(strokes()):null,snapshot=includeSnapshot?captureSnapshot():null,id=uid();const entry={id,sessionId:session.id,time:runtime.currentTime,category:document.querySelector('#vodCategory').value,player:document.querySelector('#vodPlayer').value||'TEAM',note:note||'Quadro tático',drawing,hasDrawing:!!drawing,snapshot,createdAt:new Date().toISOString()};
    store.state.vod.reviews.push(entry);try{store.save();}catch(err){entry.snapshot=null;try{store.save();alert('A imagem excedeu o espaço local disponível. A anotação foi salva sem screenshot.');}catch(inner){store.state.vod.reviews=store.state.vod.reviews.filter(n=>n.id!==id);alert('Não foi possível salvar a anotação no armazenamento local.');return;}}
    runtime.activeNoteId=id;rerender();
  }
  document.querySelector('#vodSaveNote').onclick=()=>saveNote(false);document.querySelector('#vodCapture').onclick=()=>saveNote(true);
  document.querySelector('#vodExportReport').onclick=()=>{const session=activeSession();if(!session)return;downloadBlob(`FROMBOS-VOD-${safeName(session.title)}.html`,reportHTML(session,sessionNotes(session.id)));};
  ['#vodFilterSearch','#vodFilterCategory','#vodFilterPlayer'].forEach(sel=>document.querySelector(sel)?.addEventListener(sel==='#vodFilterSearch'?'input':'change',renderTimeline));
  bindTimeline();window.addEventListener('resize',resize,{once:true});
}
