// FROMBOS V20.9 — Tactical Board + VOD Review analysis controls.
// Uses only local workspace state. No observed or competitive metric is inferred here.

import { store } from './store.js';

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value;};

function go(label,target,className='btn'){
  const button=document.createElement('button');button.type='button';button.className=className;button.textContent=label;button.onclick=()=>location.hash=`#/${target}`;return button;
}
function activeScenario(){
  const t=store.state.tactical;if(!t?.scenarios?.length)return null;return t.scenarios.find(x=>x.id===t.activeScenario)||t.scenarios[0];
}
function tacticalStats(scenario){
  const markers=scenario?.markers||[],paths=scenario?.paths||[];
  return {
    champions:markers.filter(x=>x.type==='champion').length,
    vision:markers.filter(x=>x.type==='ward'||x.type==='control').length,
    objectives:markers.filter(x=>x.type==='objective'||x.type==='danger').length,
    notes:markers.filter(x=>x.type==='text').length,
    routes:paths.filter(x=>x.type==='arrow'||x.type==='free').length,
    zones:paths.filter(x=>x.type==='zone').length
  };
}
function applyLayerPreset(ids){
  qa('#tbLayers [data-layer]').forEach(cb=>{const wanted=ids==='all'||ids.includes(cb.dataset.layer);if(cb.checked!==wanted)cb.click();});
}
function tacticalControls(){
  if(route()!=='tactical')return;
  const shell=q('.tactical-shell');const grid=shell&&q('.tactical-grid',shell);if(!shell||!grid)return;
  let bar=q('.analysis-context-v20.tactical-analysis-v20',shell);
  if(!bar){
    bar=document.createElement('section');bar.className='analysis-context-v20 tactical-analysis-v20';
    bar.innerHTML=`<div class="analysis-context-main-v20"><span class="analysis-kicker-v20">SCENARIO INTELLIGENCE</span><b class="analysis-title-v20"></b></div><div class="analysis-kpis-v20"><span><b data-tkpi="champions">0</b> campeões</span><span><b data-tkpi="vision">0</b> visão</span><span><b data-tkpi="routes">0</b> rotas/zonas</span><span><b data-tkpi="notes">0</b> notas</span></div><div class="analysis-presets-v20" role="group" aria-label="Presets de camadas"><button type="button" data-layer-preset="all">Tudo</button><button type="button" data-layer-preset="vision">Visão</button><button type="button" data-layer-preset="routes">Rotas</button><button type="button" data-layer-preset="champions">Campeões</button></div><div class="analysis-links-v20"></div>`;
    const links=q('.analysis-links-v20',bar);links.append(go('Abrir VOD Review','vod','btn info'),go('Treinos','training'));
    qa('[data-layer-preset]',bar).forEach(button=>button.onclick=()=>{const preset=button.dataset.layerPreset;if(preset==='vision')applyLayerPreset(['vision','champions','objectives']);else if(preset==='routes')applyLayerPreset(['routes','zones','champions','objectives']);else if(preset==='champions')applyLayerPreset(['champions']);else applyLayerPreset('all');});
    grid.before(bar);
  }
  const scenario=activeScenario(),stats=tacticalStats(scenario);setText(q('.analysis-title-v20',bar),scenario?.name||'Cenário ativo');setText(q('[data-tkpi="champions"]',bar),String(stats.champions));setText(q('[data-tkpi="vision"]',bar),String(stats.vision));setText(q('[data-tkpi="routes"]',bar),String(stats.routes+stats.zones));setText(q('[data-tkpi="notes"]',bar),String(stats.notes));
  bar.title=`${stats.objectives} marcador(es) de objetivo/perigo neste cenário.`;
}

function activeVodSession(){const v=store.state.vod;return v?.sessions?.find(x=>x.id===v.activeSessionId)||null;}
function sessionNotes(session){return session?(store.state.vod?.reviews||[]).filter(x=>x.sessionId===session.id):[];}
function vodStats(session){
  const notes=sessionNotes(session),categoryCounts={};notes.forEach(note=>{const key=note.category||'Nota';categoryCounts[key]=(categoryCounts[key]||0)+1;});
  const categories=Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]);const noteIds=new Set(notes.map(x=>x.id));
  const drills=(store.state.training?.sessions||[]).filter(x=>x.type==='VOD_CORRECTION_DRILL'&&noteIds.has(x.source?.noteId)).length;
  return {notes,categories,images:notes.filter(x=>x.snapshot).length,drawings:notes.filter(x=>x.hasDrawing).length,drills};
}
function applyVodCategory(category){
  const select=q('#vodFilterCategory');if(!select)return;select.value=category||'';select.dispatchEvent(new Event('change',{bubbles:true}));
}
function vodControls(){
  if(route()!=='vod')return;
  const root=q('.vod-pro');const layout=root&&q('.vod-layout',root);if(!root||!layout)return;
  let bar=q('.analysis-context-v20.vod-analysis-v20',root);
  if(!bar){
    bar=document.createElement('section');bar.className='analysis-context-v20 vod-analysis-v20';
    bar.innerHTML=`<div class="analysis-context-main-v20"><span class="analysis-kicker-v20">SESSION READ</span><b class="analysis-title-v20"></b></div><div class="analysis-kpis-v20"><span><b data-vkpi="notes">0</b> notas</span><span><b data-vkpi="images">0</b> imagens</span><span><b data-vkpi="drawings">0</b> desenhos</span><span><b data-vkpi="drills">0</b> drills</span></div><div class="vod-category-quick-v20" aria-label="Categorias desta análise"></div><div class="analysis-links-v20"></div>`;
    const links=q('.analysis-links-v20',bar);links.append(go('Tactical Board','tactical','btn info'),go('Treinos','training'));
    layout.before(bar);
  }
  const session=activeVodSession(),stats=vodStats(session);setText(q('.analysis-title-v20',bar),session?.title||'Nenhuma análise ativa');setText(q('[data-vkpi="notes"]',bar),String(stats.notes.length));setText(q('[data-vkpi="images"]',bar),String(stats.images));setText(q('[data-vkpi="drawings"]',bar),String(stats.drawings));setText(q('[data-vkpi="drills"]',bar),String(stats.drills));
  const categories=q('.vod-category-quick-v20',bar);const signature=stats.categories.map(([name,count])=>`${name}:${count}`).join('|');
  if(categories&&categories.dataset.signature!==signature){
    categories.dataset.signature=signature;categories.innerHTML='';
    if(stats.categories.length){const all=document.createElement('button');all.type='button';all.textContent=`Todas ${stats.notes.length}`;all.onclick=()=>applyVodCategory('');categories.appendChild(all);stats.categories.slice(0,5).forEach(([name,count])=>{const button=document.createElement('button');button.type='button';button.textContent=`${name} ${count}`;button.onclick=()=>applyVodCategory(name);categories.appendChild(button);});}else{const empty=document.createElement('span');empty.className='analysis-empty-v20';empty.textContent='Crie timestamps para formar a leitura da sessão.';categories.appendChild(empty);}
  }
}

function apply(){tacticalControls();vodControls();}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();
window.FROMBOS_ANALYSIS_CONTROLS_V20={apply};
