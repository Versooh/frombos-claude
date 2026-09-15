// FROMBOS V20.16 — Tactical Vision System.
// Vision markers are workspace-local. The range ring is a board visualization,
// not a conversion of Wild Rift game units. No League PC asset fallback is used.

import { store } from './store.js';

const SVG_NS='http://www.w3.org/2000/svg';
const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const svg=(tag,attrs={})=>{const el=document.createElementNS(SVG_NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el;};
const setText=(el,value)=>{if(el&&el.textContent!==String(value))el.textContent=String(value);};

function activeScenario(){
  const tactical=store.state.tactical;
  if(!tactical?.scenarios?.length)return null;
  return tactical.scenarios.find(x=>x.id===tactical.activeScenario)||tactical.scenarios[0];
}
function visionMarkers(){return (activeScenario()?.markers||[]).filter(x=>x.type==='ward'||x.type==='control');}
function layerInput(id){return q(`#tbLayers [data-layer="${id}"]`);}
function setLayer(id,wanted){const input=layerInput(id);if(input&&input.checked!==wanted)input.click();}
function visionOnly(){
  ['routes','zones','objectives','champions','notes'].forEach(id=>setLayer(id,false));setLayer('vision',true);
}
function showAll(){['routes','zones','objectives','vision','champions','notes'].forEach(id=>setLayer(id,true));}

function glyph(group,type){
  const color=type==='control'?'#ff6173':'#65dcff';
  const dark=type==='control'?'#351018':'#061721';
  const badge=svg('g',{'data-v20-vision-glyph':'1','aria-hidden':'true'});
  badge.appendChild(svg('circle',{r:22,fill:dark,stroke:color,'stroke-width':3}));
  if(type==='control'){
    badge.appendChild(svg('path',{d:'M-10 -3 L-6 -10 L0 -13 L6 -10 L10 -3 L8 8 L0 13 L-8 8Z',fill:'none',stroke:color,'stroke-width':2.5,'stroke-linejoin':'round'}));
    badge.appendChild(svg('circle',{r:4.5,fill:color}));
  }else{
    badge.appendChild(svg('path',{d:'M-12 0 Q0 -11 12 0 Q0 11 -12 0Z',fill:'none',stroke:color,'stroke-width':2.6}));
    badge.appendChild(svg('circle',{r:4,fill:color}));
    badge.appendChild(svg('line',{x1:0,y1:20,x2:0,y2:31,stroke:color,'stroke-width':3,'stroke-linecap':'round'}));
  }
  group.appendChild(badge);
}
function enhanceVisionMarkers(){
  if(route()!=='tactical')return;
  const scenario=activeScenario();if(!scenario)return;
  qa('#tbVision [data-marker-id]').forEach(group=>{
    const id=group.getAttribute('data-marker-id');const marker=scenario.markers?.find(x=>x.id===id);
    if(!marker||!['ward','control'].includes(marker.type))return;
    group.setAttribute('role','img');group.setAttribute('aria-label',marker.type==='control'?'Control Ward — marcador tático local':'Ward — marcador tático local');
    group.dataset.visionType=marker.type;
    const circles=qa(':scope > circle',group);
    const range=circles.find(c=>Number(c.getAttribute('r'))>=80);
    if(range){range.classList.add('vision-range-v20');range.setAttribute('data-range-model','BOARD_VISUAL');}
    if(!q('[data-v20-vision-glyph]',group)){
      qa(':scope > path,:scope > line',group).forEach(node=>node.remove());
      circles.filter(c=>c!==range).forEach(node=>node.remove());
      glyph(group,marker.type);
    }
    if(!q('[data-v20-vision-label]',group)){
      const label=svg('text',{x:0,y:47,'text-anchor':'middle',fill:marker.type==='control'?'#ff9aa5':'#b8efff','font-size':9,'font-weight':900,stroke:'#02060b','stroke-width':2.5,'paint-order':'stroke','data-v20-vision-label':'1'});
      label.textContent=marker.type==='control'?'CONTROL':'WARD';group.appendChild(label);
    }
  });
}

function commandPanel(){
  if(route()!=='tactical')return;
  const right=q('.tb-right');const layers=right&&q('#tbLayers',right);if(!right||!layers)return;
  let panel=q('.vision-command-v20',right);
  if(!panel){
    panel=document.createElement('section');panel.className='vision-command-v20';
    panel.innerHTML='<div class="vision-command-head-v20"><div><span>VISION CONTROL</span><b>Camada de visão</b></div><span class="vision-provenance-v20">FROMBOS_STRUCTURAL</span></div><div class="vision-command-kpis-v20"><span><b data-vision-kpi="wards">0</b> wards</span><span><b data-vision-kpi="control">0</b> control</span><span><b data-vision-kpi="total">0</b> total</span></div><div class="vision-command-actions-v20"><button type="button" class="btn info" data-vision-focus>Somente visão</button><button type="button" class="btn" data-vision-all>Todas camadas</button></div><p>O círculo representa cobertura visual no board. Não converte pixels em unidades do jogo e não é apresentado como alcance oficial.</p><small>Arte da ward: glyph tático FROMBOS até existir asset Wild Rift verificável no registry.</small>';
    q('[data-vision-focus]',panel).onclick=visionOnly;q('[data-vision-all]',panel).onclick=showAll;
    layers.before(panel);
  }
  const markers=visionMarkers(),wards=markers.filter(x=>x.type==='ward').length,control=markers.filter(x=>x.type==='control').length;
  setText(q('[data-vision-kpi="wards"]',panel),wards);setText(q('[data-vision-kpi="control"]',panel),control);setText(q('[data-vision-kpi="total"]',panel),markers.length);
  panel.classList.toggle('has-control',control>0);
}

function legend(){
  if(route()!=='tactical')return;
  const footer=q('.tb-board-footer');if(!footer)return;
  let note=q('.vision-legend-v20',footer);
  if(!note){note=document.createElement('span');note.className='vision-legend-v20';note.textContent='◉ range = visual do board · não escala de unidades';footer.appendChild(note);}
}
function apply(){commandPanel();enhanceVisionMarkers();legend();}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();

window.FROMBOS_TACTICAL_VISION_V20={apply,visionOnly,showAll};
