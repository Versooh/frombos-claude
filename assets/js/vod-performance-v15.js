// FROMBOS V15 — bridge bidirecional entre VOD Review e Performance Center.
import { store } from './store.js';

const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fmt=s=>`${String(Math.floor((s||0)/60)).padStart(2,'0')}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;
const ROLE_LABEL={BARON:'Barão',JUNGLE:'Selva',MID:'Meio',DUO:'Duo',SUPPORT:'Suporte',TEAM:'Equipe / Geral'};
const playerLabel=value=>{if(!value||value==='TEAM')return'Equipe / Geral';const p=store.state.team?.players?.[value];return`${ROLE_LABEL[value]||value}${p?.name?` · ${p.name}`:''}`;};
const noteById=id=>(store.state.vod?.reviews||[]).find(x=>x.id===id)||null;
const sessionById=id=>(store.state.vod?.sessions||[]).find(x=>x.id===id)||null;
const existingDrill=noteId=>(store.state.training?.sessions||[]).find(x=>x.type==='VOD_CORRECTION_DRILL'&&x.source?.noteId===noteId)||null;
function createDrill(note){
  if(!note)return null;const found=existingDrill(note.id);if(found)return found;const session=sessionById(note.sessionId);
  const drill={id:uid(),type:'VOD_CORRECTION_DRILL',title:`${note.category||'VOD'} · ${playerLabel(note.player)} · ${fmt(note.time)}`,status:'PENDING',plan:'Reproduzir a situação, definir a decisão correta e repetir a execução em contexto equivalente.',successCriteria:'Executar a decisão correta em situação equivalente e confirmar a correção no próximo VOD.',repetitions:3,source:{type:'VOD_NOTE',sessionId:note.sessionId,noteId:note.id},sourceTitle:session?.title||'Revisão de VOD',createdAt:new Date().toISOString()};
  store.update(s=>{s.training=s.training||{};s.training.sessions=Array.isArray(s.training.sessions)?s.training.sessions:[];s.training.sessions.push(drill);});return drill;
}
function injectTrainingButtons(){
  if(!location.hash.startsWith('#/vod'))return;
  document.querySelectorAll('[data-vod-card]').forEach(card=>{
    const id=card.dataset.vodCard,actions=card.querySelector('.vod-note-actions');if(!id||!actions||actions.querySelector('[data-vod-to-training]'))return;
    const button=document.createElement('button');button.className=`btn ${existingDrill(id)?'info':'primary'}`;button.dataset.vodToTraining=id;button.textContent=existingDrill(id)?'Abrir treino':'Enviar para treino';
    button.onclick=e=>{e.stopPropagation();const note=noteById(id);if(!note)return;createDrill(note);location.hash='#/training';};actions.prepend(button);
  });
}
function consumeFocus(){
  if(!location.hash.startsWith('#/vod'))return;const id=store.state.vod?.focusNoteId;if(!id)return;const note=noteById(id);if(!note){store.update(s=>{if(s.vod)s.vod.focusNoteId=null;});return;}
  if(store.state.vod.activeSessionId!==note.sessionId){store.update(s=>{s.vod.activeSessionId=note.sessionId;});return;}
  const target=document.querySelector(`[data-vod-id="${CSS.escape(id)}"]`);if(!target)return;target.click();target.closest('[data-vod-card]')?.scrollIntoView({behavior:'smooth',block:'center'});store.update(s=>{s.vod.focusNoteId=null;});
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;injectTrainingButtons();consumeFocus();});}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('hashchange',schedule);schedule();
