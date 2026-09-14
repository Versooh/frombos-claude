import { store } from './store.js';

const imported=new Set();
const LIMITS={scenarios:30,markers:500,paths:500,points:2500};
const markerTypes=new Set(['champion','ward','control','danger','objective','text']);
const pathTypes=new Set(['free','arrow','zone']);
const layerKeys=['routes','zones','objectives','vision','champions','notes'];
const clamp=(n,min=0,max=1000)=>Math.max(min,Math.min(max,Number.isFinite(Number(n))?Number(n):0));
const str=(v,max=220)=>String(v??'').slice(0,max);
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-5);

function decodePlan(value){
  if(!value||value.length>700000)throw new Error('payload ausente ou grande demais');
  let raw=value.replace(/ /g,'+').replace(/-/g,'+').replace(/_/g,'/');
  raw+='='.repeat((4-raw.length%4)%4);
  const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function encodePlan(value){
  const bytes=new TextEncoder().encode(JSON.stringify(value));let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
  return btoa(binary).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}
function safePoint(p){return{x:clamp(p?.x),y:clamp(p?.y)};}
function safeMarker(m){
  if(!m||!markerTypes.has(m.type))return null;
  const out={id:str(m.id||uid(),80),type:m.type,x:clamp(m.x),y:clamp(m.y)};
  if(m.type==='champion'){out.team=m.team==='red'?'red':'blue';out.label=str(m.label,80);}
  if(m.type==='text'){out.label=str(m.label,220);out.color=str(m.color||'#53d4ff',24);}
  return out;
}
function safePath(p){
  if(!p||!pathTypes.has(p.type))return null;
  const out={id:str(p.id||uid(),80),type:p.type,color:str(p.color||'#53d4ff',24),width:clamp(p.width||7,1,30)};
  if(p.type==='free'){out.points=(Array.isArray(p.points)?p.points:[]).slice(0,LIMITS.points).map(safePoint);if(out.points.length<2)return null;}
  if(p.type==='arrow'){out.a=safePoint(p.a);out.b=safePoint(p.b);}
  if(p.type==='zone'){out.c=safePoint(p.c);out.rx=clamp(p.rx,0,1000);out.ry=clamp(p.ry,0,1000);}
  return out;
}
function safeScenario(s,index){
  const layers={};for(const key of layerKeys)layers[key]=s?.layers?.[key]!==false;
  const markers=(Array.isArray(s?.markers)?s.markers:[]).slice(0,LIMITS.markers).map(safeMarker).filter(Boolean);
  const paths=(Array.isArray(s?.paths)?s.paths:[]).slice(0,LIMITS.paths).map(safePath).filter(Boolean);
  const coach=s?.coach||{};
  return {id:str(s?.id||uid(),80),name:str(s?.name||`CENÁRIO ${index+1}`,80),markers,paths,coach:{winCondition:str(coach.winCondition,600),strongSide:str(coach.strongSide,60),firstObjective:str(coach.firstObjective,60),avoid:str(coach.avoid,600),tags:(Array.isArray(coach.tags)?coach.tags:[]).slice(0,20).map(x=>str(x,40))},layers};
}
function sanitize(raw){
  if(!raw||typeof raw!=='object'||!Array.isArray(raw.scenarios)||!raw.scenarios.length)throw new Error('estrutura tática inválida');
  const scenarios=raw.scenarios.slice(0,LIMITS.scenarios).map(safeScenario);
  const active=scenarios.some(x=>x.id===String(raw.activeScenario))?String(raw.activeScenario):scenarios[0].id;
  return {activeScenario:active,scenarios,strokes:[]};
}
function banner(message,type='ok'){
  const shell=document.querySelector('.tactical-shell');if(!shell)return;
  shell.querySelector('.tb-share-banner')?.remove();const el=document.createElement('div');el.className=`tb-share-banner ${type}`;el.textContent=message;shell.prepend(el);setTimeout(()=>el.remove(),7000);
}
function maybeImport(){
  const route=location.hash.replace('#/','').split('?')[0];if(route!=='tactical')return;
  const query=location.hash.split('?')[1]||'',params=new URLSearchParams(query),payload=params.get('plan');if(!payload)return;
  const key=payload.slice(0,120)+':'+payload.length;if(imported.has(key))return;imported.add(key);
  try{const tactical=sanitize(decodePlan(payload));store.update(s=>{s.tactical=tactical;});requestAnimationFrame(()=>{banner(`Plano compartilhado carregado: ${tactical.scenarios.length} cenário(s).`);window.dispatchEvent(new HashChangeEvent('hashchange'));});}
  catch(error){requestAnimationFrame(()=>banner(`Link tático inválido: ${error.message||error}`,'error'));}
}
function bindShare(){
  if((location.hash.replace('#/','').split('?')[0]||'home')!=='tactical')return;
  const button=document.querySelector('#tbShare');if(!button||button.dataset.safeShare==='1')return;button.dataset.safeShare='1';
  button.onclick=()=>{try{const payload=encodePlan(sanitize(store.state.tactical));const url=new URL(location.href);url.hash=`#/tactical?plan=${payload}`;const result=navigator.clipboard?.writeText(url.toString());if(result)result.then(()=>banner('Link seguro do plano copiado.')).catch(()=>prompt('Copie o link:',url.toString()));else prompt('Copie o link:',url.toString());}catch(error){banner(`Não foi possível compartilhar: ${error.message||error}`,'error');}};
}
function apply(){maybeImport();bindShare();}
const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',()=>requestAnimationFrame(apply));requestAnimationFrame(apply);
