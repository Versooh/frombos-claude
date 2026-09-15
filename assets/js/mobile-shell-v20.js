// FROMBOS V20.15 — mobile shell hardening.
// Navigation/accessibility only. No workspace or competitive data is mutated.

const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const mobile=()=>matchMedia('(max-width:760px)').matches;

function ensureScrim(){
  let scrim=q('.mobile-scrim-v20');
  if(!scrim){scrim=document.createElement('button');scrim.type='button';scrim.className='mobile-scrim-v20';scrim.setAttribute('aria-label','Fechar menu');scrim.onclick=closeNav;document.body.appendChild(scrim);}
  return scrim;
}
function setState(open){
  const sidebar=q('#sidebar');const toggle=q('#menuToggle');const scrim=ensureScrim();if(!sidebar)return;
  const active=Boolean(open&&mobile());sidebar.classList.toggle('open',active);document.body.classList.toggle('mobile-nav-open-v20',active);scrim.classList.toggle('active',active);sidebar.setAttribute('aria-hidden',active?'false':mobile()?'true':'false');
  if(toggle){toggle.setAttribute('aria-expanded',active?'true':'false');toggle.setAttribute('aria-controls','sidebar');toggle.setAttribute('aria-label',active?'Fechar navegação':'Abrir navegação');}
}
function closeNav(){setState(false);}
function toggleNav(){const sidebar=q('#sidebar');setState(!sidebar?.classList.contains('open'));}
function bindShell(){
  const sidebar=q('#sidebar'),toggle=q('#menuToggle');if(!sidebar||!toggle)return;ensureScrim();
  if(toggle.dataset.v20MobileBound!=='1'){
    toggle.dataset.v20MobileBound='1';
    // app.js already toggles the class; normalize final state after that handler runs.
    toggle.addEventListener('click',()=>queueMicrotask(()=>setState(sidebar.classList.contains('open'))));
  }
  qa('[data-route]',sidebar).forEach(item=>{if(item.dataset.v20MobileBound==='1')return;item.dataset.v20MobileBound='1';item.addEventListener('click',closeNav);});
  sidebar.setAttribute('aria-label','Navegação principal FROMBOS');
  if(!mobile())setState(false);else sidebar.setAttribute('aria-hidden',sidebar.classList.contains('open')?'false':'true');
}
function onKey(event){if(event.key==='Escape'&&q('#sidebar')?.classList.contains('open')){closeNav();q('#menuToggle')?.focus();}}
function apply(){bindShell();}
function bindRuntime(){
  const runtime=window.FROMBOS_V20_RUNTIME;
  if(runtime?.subscribe){runtime.subscribe(apply);window.addEventListener('resize',()=>runtime.request('resize'));}
  else{
    let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply();});};new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('resize',schedule);window.addEventListener('load',schedule);schedule();
  }
  window.addEventListener('hashchange',closeNav);window.addEventListener('keydown',onKey);
}
bindRuntime();
window.FROMBOS_MOBILE_SHELL_V20={apply,closeNav,toggleNav};
