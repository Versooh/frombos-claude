// FROMBOS V20.20 — Composition Builder.
// User-created compositions are USER_PRIVATE hypotheses. They are never promoted to
// OFFICIAL / OBSERVED / CURATED evidence by this module.

import { CHAMPIONS, RECOVERED_COMPOSITIONS, ROLES } from './data.js';
import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
let editingId=null;
let seed=null;

function customComps(){return Array.isArray(store.state.customComps)?store.state.customComps:[];}
function findComposition(id){return [...RECOVERED_COMPOSITIONS,...customComps()].find(comp=>comp.id===id)||null;}
function poolFor(role){return store.state.team?.players?.[role]?.pool||[];}
function championOptions(role,selected=''){
  const pool=poolFor(role).filter(name=>CHAMPIONS.includes(name));
  const rest=CHAMPIONS.filter(name=>!pool.includes(name));
  const option=name=>`<option value="${esc(name)}" ${name===selected?'selected':''}>${esc(name)}</option>`;
  return `<option value="">Selecionar campeão...</option>${pool.length?`<optgroup label="Pool da função">${pool.map(option).join('')}</optgroup>`:''}<optgroup label="Roster Wild Rift">${rest.map(option).join('')}</optgroup>`;
}
function archetypeSuggestions(){return ['Engage em camadas','Proteção e escala','Cerco e alcance','Lateral e captura','Pressão early','Anti-engage','Poke','Dive','Front-to-back','Zone control'];}
function normalizeDraft(source={}){
  return {
    name:source.name||'',archetype:source.archetype||'',plan:source.plan||'',winCondition:source.winCondition||'',
    lineup:Object.fromEntries(ROLES.map(role=>[role.id,source.lineup?.[role.id]||'']))
  };
}
function closeBuilder(){
  q('.comp-builder-modal-v20')?.remove();document.body.classList.remove('comp-builder-open-v20');editingId=null;seed=null;
}
function rerenderComps(){location.hash=`#/comps?workspace=${Date.now()}`;}
function openBuilder(source=null,{edit=false}={}){
  if(route()!=='comps')return;
  closeBuilder();
  editingId=edit?source?.id||null:null;seed=normalizeDraft(source||{});
  const modal=document.createElement('div');modal.className='comp-builder-modal-v20';modal.innerHTML=`<div class="comp-builder-dialog-v20" role="dialog" aria-modal="true" aria-labelledby="compBuilderTitleV20"><div class="comp-builder-head-v20"><div><span>COMPOSITION BUILDER · USER_PRIVATE</span><h2 id="compBuilderTitleV20">${editingId?'Editar composição':'Nova composição'}</h2><p>Hipótese privada do time. Nenhum dado observado ou taxa é inferido ao salvar.</p></div><button type="button" class="btn" data-comp-builder-close aria-label="Fechar">✕</button></div><div class="comp-builder-form-v20"><label>Nome<input class="input" id="compBuilderNameV20" maxlength="80" value="${esc(seed.name)}" placeholder="Ex.: Dive 1-3-1 para scrim"></label><label>Arquétipo<input class="input" id="compBuilderArchetypeV20" list="compArchetypesV20" maxlength="60" value="${esc(seed.archetype)}" placeholder="Identidade da composição"><datalist id="compArchetypesV20">${archetypeSuggestions().map(x=>`<option value="${esc(x)}"></option>`).join('')}</datalist></label><div class="comp-builder-lineup-v20">${ROLES.map(role=>`<label><span>${esc(role.label)}</span><select class="select" data-comp-builder-role="${role.id}">${championOptions(role.id,seed.lineup[role.id])}</select></label>`).join('')}</div><label class="wide">Plano de jogo<textarea class="input" id="compBuilderPlanV20" rows="4" maxlength="700" placeholder="Como a composição cria vantagem?">${esc(seed.plan)}</textarea></label><label class="wide">Condição de vitória<textarea class="input" id="compBuilderWinV20" rows="4" maxlength="700" placeholder="O que precisa acontecer para esta comp executar o plano?">${esc(seed.winCondition)}</textarea></label></div><div class="comp-builder-proof-v20"><span><b>ORIGEM</b> USER_PRIVATE</span><span><b>ROSTER</b> WILD RIFT ONLY</span><span><b>MÉTRICAS</b> NENHUMA INFERIDA</span><span><b>EVIDÊNCIA</b> NÃO OBSERVED</span></div><div class="comp-builder-foot-v20"><span class="comp-builder-status-v20" role="status"></span><div><button type="button" class="btn" data-comp-builder-close>Cancelar</button><button type="button" class="btn primary" data-comp-builder-save>${editingId?'Salvar alterações':'Criar composição'}</button></div></div></div>`;
  document.body.appendChild(modal);document.body.classList.add('comp-builder-open-v20');
  qa('[data-comp-builder-close]',modal).forEach(button=>button.onclick=closeBuilder);
  modal.addEventListener('mousedown',event=>{if(event.target===modal)closeBuilder();});
  q('[data-comp-builder-save]',modal).onclick=saveBuilder;
  q('#compBuilderNameV20',modal)?.focus();
}
function builderPayload(){
  const lineup=Object.fromEntries(ROLES.map(role=>[role.id,q(`[data-comp-builder-role="${role.id}"]`)?.value||'']));
  return {
    name:q('#compBuilderNameV20')?.value.trim()||'',
    archetype:q('#compBuilderArchetypeV20')?.value.trim()||'',
    plan:q('#compBuilderPlanV20')?.value.trim()||'',
    winCondition:q('#compBuilderWinV20')?.value.trim()||'',lineup
  };
}
function validatePayload(payload){
  if(!payload.name)return'Informe o nome da composição.';
  if(!payload.archetype)return'Informe o arquétipo da composição.';
  const selected=[];
  for(const role of ROLES){const champion=payload.lineup[role.id];if(!champion)return`Selecione o campeão de ${role.label}.`;if(!CHAMPIONS.includes(champion))return`${champion} não pertence ao roster Wild Rift deste build.`;selected.push(champion);}
  if(new Set(selected).size!==selected.length)return'Cada função precisa usar um campeão diferente.';
  if(!payload.plan)return'Descreva o plano de jogo.';
  if(!payload.winCondition)return'Descreva a condição de vitória.';
  return'';
}
function saveBuilder(){
  const payload=builderPayload();const error=validatePayload(payload);const status=q('.comp-builder-status-v20');
  if(error){if(status)status.textContent=error;return;}
  const now=new Date().toISOString();
  store.update(state=>{
    state.customComps=Array.isArray(state.customComps)?state.customComps:[];
    if(editingId){
      const index=state.customComps.findIndex(comp=>comp.id===editingId);
      if(index>=0)state.customComps[index]={...state.customComps[index],...payload,origin:'USER_PRIVATE',patch:'workspace local',updatedAt:now};
    }else{
      state.customComps.push({id:`custom-${uid()}`,...payload,origin:'USER_PRIVATE',patch:'workspace local',createdAt:now,updatedAt:now});
    }
  });
  closeBuilder();rerenderComps();
}
function deleteCustom(id){
  const comp=customComps().find(item=>item.id===id);if(!comp)return;
  if(!confirm(`Excluir a composição privada “${comp.name}”?`))return;
  store.update(state=>{state.customComps=(state.customComps||[]).filter(item=>item.id!==id);if(state.draft?.referenceComp?.id===id)state.draft.referenceComp=null;});
  rerenderComps();
}
function injectCardActions(){
  if(route()!=='comps')return;
  qa('.composition-card').forEach(card=>{
    const id=q('[data-comp-draft]',card)?.dataset.compDraft;if(!id)return;const actions=q('.comp-card-actions',card);if(!actions)return;
    if(!q('[data-comp-clone-v20]',actions)){
      const clone=document.createElement('button');clone.type='button';clone.className='btn comp-author-secondary-v20';clone.dataset.compCloneV20=id;clone.textContent='Adaptar';clone.title='Criar uma cópia USER_PRIVATE para edição';clone.onclick=()=>openBuilder(findComposition(id));actions.insertBefore(clone,actions.lastElementChild||null);
    }
    const custom=customComps().some(comp=>comp.id===id);card.classList.toggle('is-user-private-v20',custom);
    if(custom&&!q('[data-comp-edit-v20]',actions)){
      const edit=document.createElement('button');edit.type='button';edit.className='btn comp-author-secondary-v20';edit.dataset.compEditV20=id;edit.textContent='Editar';edit.onclick=()=>openBuilder(findComposition(id),{edit:true});actions.insertBefore(edit,actions.lastElementChild||null);
      const remove=document.createElement('button');remove.type='button';remove.className='btn danger-outline comp-author-delete-v20';remove.dataset.compDeleteV20=id;remove.textContent='Excluir';remove.onclick=()=>deleteCustom(id);actions.insertBefore(remove,actions.lastElementChild||null);
    }
  });
}
function ensureAuthorBar(){
  if(route()!=='comps')return;const content=q('.content[data-page="comps"]');const toolbar=content&&q('.comp-toolbar-v20',content);if(!content||!toolbar)return;
  let bar=q('.comp-author-v20',content);
  if(!bar){bar=document.createElement('section');bar.className='comp-author-v20';bar.innerHTML='<div><span>TEAM COMPOSITION WORKSPACE</span><b>Crie hipóteses próprias sem misturar evidência</b><small>Composições criadas aqui ficam no workspace local como USER_PRIVATE.</small></div><div class="comp-author-meta-v20"><span><b data-custom-comp-count>0</b> privadas</span><button type="button" class="btn primary" data-new-comp-v20>＋ Nova composição</button></div>';toolbar.after(bar);q('[data-new-comp-v20]',bar).onclick=()=>openBuilder();}
  const count=q('[data-custom-comp-count]',bar);if(count)count.textContent=String(customComps().length);
}
function onKey(event){if(event.key==='Escape'&&q('.comp-builder-modal-v20'))closeBuilder();}
function apply(){ensureAuthorBar();injectCardActions();}
function bindRuntime(){const runtime=window.FROMBOS_V20_RUNTIME;if(runtime?.subscribe){runtime.subscribe(apply);return;}let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});};new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();}
window.addEventListener('keydown',onKey);bindRuntime();
window.FROMBOS_COMPOSITION_BUILDER_V20={apply,openBuilder};
