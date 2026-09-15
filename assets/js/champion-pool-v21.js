import { CHAMPIONS, ROLES } from './data.js';
import { CHAMPION_REGISTRY } from './champion-registry.generated.js';
import { store } from './store.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const profile=name=>store.state.championProfiles?.[name]||{};
const roleLabel=id=>ROLES.find(r=>r.id===id)?.label||id;
const roleIdsFor=name=>ROLES.filter(r=>store.state.team?.players?.[r.id]?.pool?.includes(name)).map(r=>r.id);
const poolSet=()=>new Set(ROLES.flatMap(r=>store.state.team?.players?.[r.id]?.pool||[]));
const asset=name=>CHAMPION_REGISTRY[name]||null;
const evidenceBadge=(type='USER_PRIVATE')=>`<span class="fb-evidence fb-evidence-${type.toLowerCase().replace(/_/g,'-')}">${type}</span>`;

function portrait(name,kind='portrait'){
  const data=asset(name); const url=data?.[kind]||data?.portrait;
  if(url) return `<img src="${esc(url)}" alt="${esc(name)}" loading="lazy" decoding="async">`;
  return `<div class="fb-pool-fallback" aria-label="Sem arte oficial materializada">${esc(name.slice(0,1))}</div>`;
}

function card(name){
  const p=profile(name), roles=roleIdsFor(name), inPool=roles.length>0;
  const mastery=p.mastery?esc(p.mastery):'UNKNOWN';
  const training=p.trainingStatus?esc(p.trainingStatus):'Sem status';
  return `<article class="fb-pool-card ${inPool?'is-in-pool':''}" data-pool-card="${esc(name)}" data-name="${esc(name.toLowerCase())}" data-role="${esc(roles.join(' '))}">
    <div class="fb-pool-art">${portrait(name)}<div class="fb-pool-art-gradient"></div><button class="fb-pool-favorite ${p.favorite?'is-on':''}" data-favorite="${esc(name)}" title="Favorito" aria-label="Alternar favorito">★</button></div>
    <div class="fb-pool-body">
      <div class="fb-pool-title"><div><b>${esc(name)}</b><small>${roles.length?roles.map(roleLabel).join(' · '):'Fora do pool'}</small></div>${evidenceBadge('USER_PRIVATE')}</div>
      <div class="fb-pool-meta"><span><small>MAESTRIA</small><strong>${mastery}</strong></span><span><small>TREINO</small><strong>${training}</strong></span></div>
      <div class="fb-pool-tags">${roles.map(r=>`<span>${esc(roleLabel(r))}</span>`).join('')}${p.comfort?`<span>${esc(p.comfort)}</span>`:''}${p.trainingStatus?`<span>${esc(p.trainingStatus)}</span>`:''}</div>
      <button class="btn info fb-pool-open" data-open-champion="${esc(name)}">Abrir análise <span>→</span></button>
    </div>
  </article>`;
}

function unknownPanel(title,description){
  return `<section class="fb-lab-unknown"><div><div class="eyebrow">${esc(title)}</div><h3>UNKNOWN</h3><p>${esc(description)}</p></div>${evidenceBadge('UNKNOWN')}</section>`;
}

function mainPool(){
  return `<div class="fb-pool-controls">
    <label class="fb-pool-search"><span>⌕</span><input id="poolSearchV21" class="input" placeholder="Buscar campeão no workspace..." autocomplete="off"></label>
    <div class="fb-role-filters"><button class="is-active" data-role-filter="ALL">Todos</button>${ROLES.map(r=>`<button data-role-filter="${r.id}">${r.label}</button>`).join('')}</div>
    <label class="fb-only-pool"><input type="checkbox" id="poolOnlyV21"> somente meu pool</label>
  </div>
  <div class="fb-pool-grid" id="poolGridV21">${CHAMPIONS.map(card).join('')}</div>`;
}

function panelFor(tab){
  if(tab==='pool') return mainPool();
  if(tab==='meta') return unknownPanel('META GLOBAL','Sem uma fonte observada válida materializada para esta visão, o FROMBOS não cria pick rate, ban rate, tier ou win rate.');
  if(tab==='compare') return unknownPanel('COMPARAR CAMPEÕES','A comparação quantitativa permanece UNKNOWN até existir evidência compatível. Use o Champion Intelligence para comparar informações documentadas.');
  if(tab==='synergy') return unknownPanel('SINERGIAS','Nenhum percentual de sinergia é inferido. Relações estruturais e composições registradas continuam separadas de dados observados.');
  return unknownPanel('RECOMENDAÇÕES','O sistema não cria recomendações competitivas sem base materializada. Decisões do coach permanecem USER_PRIVATE.');
}

export function championPoolLabHTML(){
  const uniquePool=poolSet().size;
  return `<section class="fb-pool-hero">
    <div class="fb-pool-hero-copy"><div class="eyebrow">FROMBOS · RUNETERRA COMPETITIVE SYSTEM</div><h1>CHAMPION POOL <span>+</span><br>META LAB</h1><p><strong>Conheça. Domine. Evolua.</strong><br>Transforme escolhas em decisões melhores sem transformar ausência de evidência em números.</p></div>
    <div class="fb-pool-hero-stats"><div><small>CAMPEÕES NO POOL</small><b>${uniquePool||'—'}</b><span>${uniquePool?'USER_PRIVATE':'sem dados'}</span></div><div><small>EVIDÊNCIA</small><b>5</b><span>camadas separadas</span></div><div><small>WILD RIFT</small><b>ONLY</b><span>sem fallback PC</span></div></div>
  </section>
  <section class="fb-meta-lab card">
    <div class="fb-meta-tabs" role="tablist">
      <button class="is-active" data-pool-tab="pool">Meu Pool</button><button data-pool-tab="meta">Meta Global</button><button data-pool-tab="compare">Comparar Campeões</button><button data-pool-tab="synergy">Sinergias</button><button data-pool-tab="recommend">Recomendações</button>
    </div>
    <div class="fb-evidence-legend">${['OFFICIAL','OBSERVED','CURATED','FROMBOS_STRUCTURAL','USER_PRIVATE','UNKNOWN'].map(e=>evidenceBadge(e)).join('')}</div>
    <div id="poolPanelV21">${mainPool()}</div>
  </section>
  <div class="fb-champion-drawer-backdrop" data-close-drawer></div><aside class="fb-champion-drawer" id="championDrawerV21" aria-hidden="true"></aside>`;
}

function renderDrawer(name){
  const p=profile(name), roles=roleIdsFor(name), a=asset(name);
  const drawer=document.querySelector('#championDrawerV21'); if(!drawer)return;
  drawer.innerHTML=`<div class="fb-drawer-hero" ${a?.splash?`style="--drawer-splash:url('${esc(a.splash)}')"`:''}><button class="fb-drawer-close" data-close-drawer>×</button><div class="fb-drawer-portrait">${portrait(name)}</div><div><div class="eyebrow">CHAMPION DETAIL</div><h2>${esc(name)}</h2><p>${roles.length?roles.map(roleLabel).join(' · '):'Fora do champion pool atual'}</p><div class="fb-drawer-tags">${evidenceBadge('OFFICIAL')} ${evidenceBadge('USER_PRIVATE')}</div></div></div>
    <div class="fb-drawer-tabs"><button class="is-active">Visão Geral</button><button data-jump="builds">Builds</button><button data-jump="matchups">Matchups</button><button>Sinergias</button><button>Notas</button></div>
    <div class="fb-drawer-body">
      <div class="fb-drawer-grid"><label>Maestria local<input class="input" data-profile-field="mastery" value="${esc(p.mastery||'')}" placeholder="Ex.: Alta / 7 / texto local"></label><label>Conforto<select class="select" data-profile-field="comfort"><option value="">UNKNOWN</option>${['Conforto','Treino','Situacional','Desenvolvimento'].map(x=>`<option ${p.comfort===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Status de treino<select class="select" data-profile-field="trainingStatus"><option value="">Sem status</option>${['Planejado','Em andamento','Concluído'].map(x=>`<option ${p.trainingStatus===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Champion Pool<input class="input" value="${esc(roles.length?roles.map(roleLabel).join(' · '):'Fora do pool')}" disabled></label></div>
      <section class="fb-drawer-evidence"><div><small>MATCHUPS OBSERVADOS</small><b>UNKNOWN</b><span>Nenhuma taxa é fabricada.</span></div><div><small>BUILDS</small><b>${a?'Disponível via laboratório':'UNKNOWN'}</b><span>Proveniência preservada.</span></div></section>
      <label class="fb-notes-label">Notas do coach<textarea class="textarea" data-profile-field="notes" placeholder="Notas USER_PRIVATE...">${esc(p.notes||'')}</textarea></label>
      <div class="fb-drawer-actions"><button class="btn ${p.favorite?'primary':'info'}" data-favorite="${esc(name)}">${p.favorite?'★ Favorito':'☆ Favoritar'}</button><button class="btn" data-jump="champions">Abrir Champion Intelligence</button></div>
    </div>`;
  drawer.dataset.champion=name; drawer.setAttribute('aria-hidden','false'); document.body.classList.add('fb-drawer-open');
}

function closeDrawer(){document.querySelector('#championDrawerV21')?.setAttribute('aria-hidden','true');document.body.classList.remove('fb-drawer-open');}

function bindPanel(){
  const search=document.querySelector('#poolSearchV21'), only=document.querySelector('#poolOnlyV21'); let role='ALL';
  const apply=()=>document.querySelectorAll('[data-pool-card]').forEach(card=>{const okText=!search?.value||card.dataset.name.includes(search.value.toLowerCase());const okRole=role==='ALL'||card.dataset.role.split(' ').includes(role);const okPool=!only?.checked||card.classList.contains('is-in-pool');card.hidden=!(okText&&okRole&&okPool);});
  search?.addEventListener('input',apply);only?.addEventListener('change',apply);
  document.querySelectorAll('[data-role-filter]').forEach(btn=>btn.addEventListener('click',()=>{role=btn.dataset.roleFilter;document.querySelectorAll('[data-role-filter]').forEach(x=>x.classList.toggle('is-active',x===btn));apply();}));
  document.querySelectorAll('[data-open-champion]').forEach(btn=>btn.addEventListener('click',()=>renderDrawer(btn.dataset.openChampion)));
}

export function bindChampionPoolLab(render){
  document.querySelectorAll('[data-pool-tab]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-pool-tab]').forEach(x=>x.classList.toggle('is-active',x===btn));const panel=document.querySelector('#poolPanelV21');if(panel){panel.innerHTML=panelFor(btn.dataset.poolTab);bindPanel();}}));
  bindPanel();
  document.addEventListener('click',event=>{
    const close=event.target.closest?.('[data-close-drawer]'); if(close){closeDrawer();return;}
    const fav=event.target.closest?.('[data-favorite]'); if(fav){event.preventDefault();event.stopPropagation();const name=fav.dataset.favorite;store.update(s=>{s.championProfiles??={};s.championProfiles[name]??={};s.championProfiles[name].favorite=!s.championProfiles[name].favorite;});if(document.body.classList.contains('fb-drawer-open'))renderDrawer(name);else render?.();return;}
    const jump=event.target.closest?.('[data-jump]'); if(jump){location.hash=`#/${jump.dataset.jump}?champion=${encodeURIComponent(document.querySelector('#championDrawerV21')?.dataset.champion||'')}`;}
  });
  document.addEventListener('change',event=>{const field=event.target?.dataset?.profileField;if(!field)return;const name=document.querySelector('#championDrawerV21')?.dataset.champion;if(!name)return;store.update(s=>{s.championProfiles??={};s.championProfiles[name]??={};s.championProfiles[name][field]=event.target.value;});});
  document.addEventListener('input',event=>{if(event.target?.dataset?.profileField!=='notes')return;const name=document.querySelector('#championDrawerV21')?.dataset.champion;if(!name)return;clearTimeout(bindChampionPoolLab.noteTimer);bindChampionPoolLab.noteTimer=setTimeout(()=>store.update(s=>{s.championProfiles??={};s.championProfiles[name]??={};s.championProfiles[name].notes=event.target.value;}),180);});
}
