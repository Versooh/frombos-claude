// FROMBOS V24.6 — Command Center Rebuild
// Read-only cockpit over local workspace + materialized Wild Rift evidence.
import { store } from './store.js';
import { ROLES, RECOVERED_COMPOSITIONS } from './data.js';
import { CHAMPION_REGISTRY } from './champion-registry.generated.js';
import { OPEN_SERIES_PLAYERS } from './open-series-scouting.generated.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const values=()=>Object.values(CHAMPION_REGISTRY||{});
const asset=name=>CHAMPION_REGISTRY?.[name]||values().find(x=>x?.name===name)||null;
const portrait=(name,cls)=>{
  const a=asset(name),src=a?.portrait||a?.splash;
  return src?'<img class="'+cls+'" src="'+esc(src)+'" alt="'+esc(name)+'" loading="lazy" decoding="async">':'<span class="'+cls+' v246-fallback">'+esc(String(name||'?').slice(0,1))+'</span>';
};
const icon=id=>'<span class="v246-glyph" data-icon="'+id+'" aria-hidden="true"></span>';
const draft=()=>store.state.draft||{};
const currentActions=()=>{
  const d=draft(),g=Number(d.game)||1;
  return Array.isArray(d.actions)&&d.actions.length?d.actions:(d.games?.[g]?.actions||[]);
};
const fearless=()=>{
  const d=draft(),m=d.fearlessMode||(d.fearless?'global':'off');
  return m==='global'?'GLOBAL':m==='team'?'POR EQUIPE':'OFF';
};
const series=()=>{
  const d=draft(),limit=d.format==='MD3'?3:5;
  const games=Array.from({length:limit},(_,i)=>{
    const actions=d.games?.[i+1]?.actions||[];
    return {game:i+1,actions:actions.length,complete:actions.length>=20};
  });
  return {limit,games,touched:games.filter(x=>x.actions).length};
};
const observed=()=>{
  const opponent=store.state.team?.opponent||'';
  return OPEN_SERIES_PLAYERS.filter(p=>norm(p.team)===norm(opponent));
};
const heroAsset=()=>['Jinx',"Kai'Sa",'Ahri','Irelia','Akali'].map(asset).find(a=>a?.splash||a?.portrait)||values().find(a=>a?.splash)||values()[0]||null;

function quick(id,title,desc,state){
  return '<button class="v246-quick" data-v246-go="'+id+'">'+icon(id)+'<span><b>'+esc(title)+'</b><small>'+esc(desc)+'</small></span><em>'+esc(state)+'</em>'+icon('arrow')+'</button>';
}
function compCard(c){
  return '<button class="v246-comp" data-v246-go="comps"><div class="v246-comp-lineup">'+ROLES.map(r=>c.lineup?.[r.id]?portrait(c.lineup[r.id],'v246-comp-img'):'<i>—</i>').join('')+'</div><small>'+esc(c.origin||'CURATED')+'</small><b>'+esc(c.name||'Composição')+'</b></button>';
}
function draftSnapshot(){
  const d=draft(),actions=[...currentActions()].sort((a,b)=>(a.step||0)-(b.step||0));
  const side=(name,tone)=>{
    const picks=actions.filter(a=>a.side===tone&&a.type==='pick').map(a=>a.champ);
    const bans=actions.filter(a=>a.side===tone&&a.type==='ban').map(a=>a.champ);
    return '<section data-side="'+tone+'"><header><b>'+esc(name)+'</b><small>'+esc(tone==='blue'?store.state.team?.name:store.state.team?.opponent)+'</small></header><div class="v246-picks">'+Array.from({length:5},(_,i)=>picks[i]?portrait(picks[i],'v246-pick-img'):'<i>'+(i+1)+'</i>').join('')+'</div><div class="v246-bans">'+Array.from({length:5},(_,i)=>bans[i]?portrait(bans[i],'v246-ban-img'):'<i>—</i>').join('')+'</div></section>';
  };
  return '<article class="v246-panel v246-draft"><div class="v246-panel-head"><div><span>DRAFT SNAPSHOT · G'+(Number(d.game)||1)+'</span><h2>'+(actions.length?actions.length+'/20 ações registradas':'Draft ainda não iniciado')+'</h2></div><button data-v246-go="draft">Continuar Draft '+icon('arrow')+'</button></div><div class="v246-draft-stage">'+side('AZUL','blue')+'<div class="v246-vs"><b>VS</b><small>FEARLESS '+fearless()+'</small></div>'+side('VERMELHO','red')+'</div><footer>USER_PRIVATE · nenhuma escolha automática</footer></article>';
}
function poolPanel(){
  const players=store.state.team?.players||{};
  return '<article class="v246-panel v246-pool"><div class="v246-panel-head"><div><span>CHAMPION POOL</span><h2>Profundidade por função</h2></div><button data-v246-go="team">Configurar elenco '+icon('arrow')+'</button></div><div class="v246-role-grid">'+ROLES.map(r=>{
    const p=players[r.id]||{},pool=p.pool||[];
    return '<section><div><span>'+esc(r.label)+'</span><b>'+esc(p.name||'Não configurado')+'</b><small>'+(pool.length?pool.length+' campeão(ões)':'Pool vazio')+'</small></div><div class="v246-role-champs">'+(pool.length?pool.slice(0,4).map(c=>portrait(c,'v246-role-img')).join(''):'<i>+</i>')+(pool.length>4?'<em>+'+(pool.length-4)+'</em>':'')+'</div></section>';
  }).join('')+'</div></article>';
}
function scoutingPanel(){
  const opponent=store.state.team?.opponent||'ADVERSÁRIO',players=observed();
  return '<article class="v246-panel v246-scout"><div class="v246-panel-head"><div><span>SCOUTING RADAR</span><h2>'+esc(opponent)+'</h2></div><em class="v246-evidence" data-kind="'+(players.length?'observed':'unknown')+'">'+(players.length?'OBSERVED':'UNKNOWN')+'</em></div><p>'+(players.length?players.length+' jogador(es) materializado(s). Favorito observado não é prioridade automática de ban.':'Nenhuma evidência materializada corresponde ao adversário atual.')+'</p><div class="v246-scout-list">'+(players.length?players.slice(0,5).map(p=>'<div>'+portrait(p.favorite,'v246-scout-img')+'<span><b>'+esc(p.name)+'</b><small>Favorito observado · '+esc(p.favorite||'UNKNOWN')+'</small></span></div>').join(''):'<div class="v246-unknown"><b>UNKNOWN</b><span>Abra o War Room para revisar o adversário.</span></div>')+'</div><button class="v246-main-action" data-v246-go="scouting">'+icon('scouting')+' Abrir War Room</button></article>';
}
function workCard(id,title,count,detail){
  return '<button class="v246-work-card" data-v246-go="'+id+'">'+icon(id)+'<span><small>'+title+'</small><b>'+count+'</b><em>'+detail+'</em></span>'+icon('arrow')+'</button>';
}

export function commandCenterHTML(){
  const d=draft(),s=series(),actions=currentActions(),hero=heroAsset(),op=store.state.team?.opponent||'ADVERSÁRIO';
  const configured=ROLES.filter(r=>{const p=store.state.team?.players?.[r.id];return p?.name||(p?.pool||[]).length;}).length;
  const tactical=store.state.tactical?.scenarios?.length||0,vod=store.state.vod?.sessions?.length||0,training=store.state.training?.sessions?.length||0;
  const continueTo=actions.length&&actions.length<20?'draft':s.touched?'series':norm(op)&&norm(op)!=='adversario'?'scouting':'team';
  const art=hero?.splash||hero?.portrait||'';
  const ref=d.referenceComp,custom=Array.isArray(store.state.customComps)?store.state.customComps:[];
  const comps=[...(ref?[{...ref,origin:'USER_PRIVATE'}]:[]),...custom.slice(-1),...RECOVERED_COMPOSITIONS].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(0,3);
  return '<section class="v246-command-center" data-v246-command-center>'+
    '<section class="v246-hero"><div class="v246-hero-art">'+(art?'<img src="'+esc(art)+'" alt="'+esc(hero?.name||'Wild Rift')+' — arte oficial Wild Rift" fetchpriority="high" decoding="async">':'')+'<span>'+esc(hero?.name||'WILD RIFT')+' · RIOT OFFICIAL</span></div>'+
    '<div class="v246-hero-copy"><span class="v246-kicker">CENTRAL DE COMANDO · WILD RIFT</span><small>O PRÓXIMO GG COMEÇA NO DRAFT.</small><h1>Prepare a próxima série.<br><strong>Entre com um plano.</strong></h1><div class="v246-context"><span>'+esc(store.state.team?.name||'TIME')+'</span><i>VS</i><span>'+esc(op)+'</span><b>G'+(Number(d.game)||1)+'</b><b>'+esc(d.format||'MD5')+'</b><b>FEARLESS '+fearless()+'</b></div><div class="v246-hero-actions"><button class="primary" data-v246-go="'+continueTo+'">Continuar preparação '+icon('arrow')+'</button><button data-v246-go="draft">'+icon('draft')+' Abrir Draft</button><button data-v246-go="series">'+icon('series')+' Ver Série</button></div></div>'+
    '<div class="v246-hero-kpis"><article><small>ELENCO</small><b>'+configured+'/5</b><span>posições</span></article><article><small>DRAFT G'+(Number(d.game)||1)+'</small><b>'+actions.length+'/20</b><span>ações</span></article><article><small>SÉRIE</small><b>'+s.touched+'/'+s.limit+'</b><span>com estado</span></article></div></section>'+
    '<nav class="v246-quick-grid">'+quick('draft','Sala de Draft','Picks, bans e branches','G'+(Number(d.game)||1)+' · '+actions.length+'/20')+quick('series','Fearless / Série','Estado compartilhado entre jogos',s.touched+'/'+s.limit+' com estado')+quick('scouting','Scouting','War Room do adversário',op)+quick('tactical','Tactical Board','Cenários e mapa',tactical+' cenário(s)')+quick('vod','VOD Review','Evidência e revisão',vod+' sessão(ões)')+quick('team','Champion Pool','Profundidade do elenco',configured+'/5 funções')+'</nav>'+
    '<div class="v246-grid"><article class="v246-panel v246-series"><div class="v246-panel-head"><div><span>PRÓXIMA SÉRIE</span><h2>'+esc(store.state.team?.name||'TIME')+' <i>vs</i> '+esc(op)+'</h2></div><em>G'+(Number(d.game)||1)+' · '+esc(d.format||'MD5')+'</em></div><div class="v246-series-track">'+s.games.map(g=>'<button data-v246-go="series" data-state="'+(g.complete?'complete':g.actions?'active':'empty')+'" '+(g.game===Number(d.game)?'aria-current="true"':'')+'><small>G'+g.game+'</small><b>'+g.actions+'/20</b><span>'+(g.complete?'COMPLETO':g.actions?'EM CURSO':'SEM ESTADO')+'</span></button>').join('')+'</div><div class="v246-series-meta"><div><small>FEARLESS</small><b>'+fearless()+'</b></div><div><small>CONTEXTO</small><b>'+esc(d.tournament||'Scrim / Treino')+'</b></div><div><small>REFERÊNCIA</small><b>'+esc(ref?.name||'UNKNOWN')+'</b></div></div><button class="v246-main-action" data-v246-go="series">'+icon('series')+' Abrir Series Command</button></article>'+
    draftSnapshot()+poolPanel()+scoutingPanel()+
    '<article class="v246-panel v246-comps"><div class="v246-panel-head"><div><span>COMPOSITION LAB</span><h2>Planos para preparar</h2></div><button data-v246-go="comps">Ver todas '+icon('arrow')+'</button></div><div class="v246-comp-grid">'+comps.map(compCard).join('')+'</div></article>'+
    '<section class="v246-work-grid">'+workCard('tactical','TACTICAL',tactical,tactical?'cenários salvos':'nenhum cenário')+workCard('vod','VOD REVIEW',vod,vod?'sessões locais':'nenhuma sessão')+workCard('training','TRAINING',training,training?'sessões salvas':'nenhuma sessão')+'</section>'+
    '</div></section>';
}

export function bindCommandCenter(){
  document.querySelectorAll('[data-v246-go]').forEach(el=>el.addEventListener('click',()=>{location.hash='#/'+el.dataset.v246Go;}));
}
