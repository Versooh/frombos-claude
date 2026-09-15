// FROMBOS V20.17 — shared render runtime for late V20 presentation layers.
// One DOM observer + one requestAnimationFrame queue replaces repeated observers.
// This runtime never reads or mutates competitive data.

const subscribers=new Set();
let observer=null;
let pending=false;
let lastReason='boot';
let frameCount=0;
let mutationBatches=0;

const route=()=>location.hash.replace('#/','').split('?')[0]||'home';

function run(reason=lastReason){
  pending=false;lastReason=reason;frameCount++;
  const context={reason,route:route(),frame:frameCount,mutationBatches};
  subscribers.forEach(fn=>{
    try{fn(context);}catch(error){console.error('[FROMBOS V20 runtime]',error);}
  });
  window.dispatchEvent(new CustomEvent('frombos:v20-render',{detail:context}));
}
function request(reason='update'){
  lastReason=reason;
  if(pending)return;
  pending=true;
  requestAnimationFrame(()=>run(lastReason));
}
function subscribe(fn,{immediate=true}={}){
  if(typeof fn!=='function')return()=>{};
  subscribers.add(fn);
  if(immediate)queueMicrotask(()=>{if(subscribers.has(fn)){try{fn({reason:'subscribe',route:route(),frame:frameCount,mutationBatches});}catch(error){console.error('[FROMBOS V20 runtime]',error);}}});
  return()=>subscribers.delete(fn);
}
function attachObserver(){
  const target=document.querySelector('#app')||document.body||document.documentElement;
  if(!target)return;
  observer?.disconnect();
  observer=new MutationObserver(()=>{mutationBatches++;request('mutation');});
  observer.observe(target,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','disabled','aria-pressed','aria-current']});
}
function appEvent(event){
  if(event.target instanceof Element&&event.target.closest('#app'))request(event.type);
}
function stats(){return{route:route(),subscribers:subscribers.size,frames:frameCount,mutationBatches,pending};}

window.addEventListener('hashchange',()=>request('hashchange'));
window.addEventListener('load',()=>{attachObserver();request('load');});
document.addEventListener('change',appEvent,true);
document.addEventListener('input',appEvent,true);

attachObserver();
request('boot');

window.FROMBOS_V20_RUNTIME={subscribe,request,stats,reattach:attachObserver};
