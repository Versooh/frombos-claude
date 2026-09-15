// FROMBOS V20.19 — Tactical Map Delivery.
// Prewarms only the exact local Wild Rift map already owned by Tactical Board.
// This layer never changes map href, geometry, coordinates or fallback policy.

const MAP_URL='./assets/img/wild-rift-map.jpg';
const route=()=>location.hash.replace('#/','').split('?')[0]||'home';
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];

let preloadImage=null;
let preloadState='idle';
let preloadReason='';

function requestRender(reason){window.FROMBOS_V20_RUNTIME?.request?.(reason);}
function connectionSavesData(){return Boolean(navigator.connection?.saveData);}
function prewarm(reason='intent'){
  if(preloadState==='loading'||preloadState==='ready')return;
  if(reason==='hover'&&connectionSavesData())return;
  preloadReason=reason;preloadState='loading';
  const image=new Image();preloadImage=image;image.decoding='async';
  try{image.fetchPriority='high';}catch{}
  image.onload=async()=>{
    try{await image.decode?.();}catch{}
    preloadState='ready';requestRender('tactical-map-prewarmed');
  };
  image.onerror=()=>{preloadState='error';requestRender('tactical-map-prewarm-error');};
  image.src=MAP_URL;
}
function bindIntent(){
  qa('[data-route="tactical"],[data-go="tactical"]').forEach(control=>{
    if(control.dataset.mapIntentV20==='1')return;
    control.dataset.mapIntentV20='1';
    control.addEventListener('pointerenter',()=>prewarm('hover'),{passive:true});
    control.addEventListener('focus',()=>prewarm('focus'));
    control.addEventListener('pointerdown',()=>prewarm('pointerdown'),{passive:true});
  });
}
function mapSource(image){
  const href=image?.getAttribute('href')||'';
  if(!href)return'unknown';
  return href.includes('assets/img/wild-rift-map.jpg')?'local':'recovered';
}
function setBoardState(state){
  const card=q('.tb-board-card');if(card)card.dataset.mapDeliveryV20=state;
  const badge=q('.map-delivery-v20');
  if(!badge)return;
  const labels={idle:'MAPA EXATO',loading:'CARREGANDO MAPA',ready:'MAPA LOCAL PRONTO',recovered:'MAPA RECUPERADO',error:'MAPA LOCAL INDISPONÍVEL'};
  badge.textContent=labels[state]||labels.idle;badge.dataset.state=state;
}
function ensureBadge(){
  const meta=q('.tb-board-meta');if(!meta)return null;
  let badge=q('.map-delivery-v20',meta);
  if(!badge){badge=document.createElement('span');badge.className='map-delivery-v20';badge.title='Estado de entrega do mesmo mapa exato usado pelo Tactical Board.';meta.appendChild(badge);}
  return badge;
}
function bindMapElement(){
  if(route()!=='tactical')return;
  const image=q('#tbMapImage');if(!image)return;
  ensureBadge();
  if(image.dataset.deliveryBoundV20!=='1'){
    image.dataset.deliveryBoundV20='1';
    image.addEventListener('load',()=>{setBoardState(mapSource(image)==='local'?'ready':'recovered');});
    image.addEventListener('error',()=>{setBoardState('error');});
  }
  const source=mapSource(image);
  if(source==='recovered')setBoardState('recovered');
  else if(preloadState==='ready')setBoardState('ready');
  else if(preloadState==='loading')setBoardState('loading');
  else if(preloadState==='error')setBoardState('error');
  else{setBoardState('loading');prewarm('route');}
}
function apply(){bindIntent();bindMapElement();}
function bindRuntime(){
  const runtime=window.FROMBOS_V20_RUNTIME;
  if(runtime?.subscribe){runtime.subscribe(apply);return;}
  let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});};
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('hashchange',schedule);window.addEventListener('load',schedule);schedule();
}
bindRuntime();

window.FROMBOS_TACTICAL_MAP_DELIVERY_V20={apply,prewarm,stats:()=>({state:preloadState,reason:preloadReason,saveData:connectionSavesData()})};
