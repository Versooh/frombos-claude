import { portraitHTML } from './champion-intelligence.js';
import { OPEN_SERIES_SNAPSHOT } from './competitive-intelligence.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const META_SNAPSHOT={
  retrievedAt:'2026-09-14',
  patch:{version:'7.2e',published:'2026-09-09',source:'Riot Games',url:'https://wildrift.leagueoflegends.com/pt-br/news/game-updates/wild-rift-patch-notes-72e/',changes:[
    {champ:'Vi',direction:'NERF',note:'Riot reduziu o scaling de dano de Quebra-Cofres e aumentou o cooldown da ultimate.'},
    {champ:'Swain',direction:'NERF',note:'Riot anunciou redução de poder no patch 7.2e.'},
    {champ:'Janna',direction:'BUFF',note:'Riot reforçou a proteção dos escudos.'},
    {champ:'Nautilus',direction:'BUFF',note:'Riot listou Nautilus entre os campeões fortalecidos.'},
    {champ:'Malphite',direction:'BUFF',note:'Riot listou Malphite entre os campeões fortalecidos.'}
  ]},
  cn:{source:'WildRiftFire · China official ranked stats',url:'https://www.wildriftfire.com/stats',patch:'7.2e',scope:'default public table snapshot · role-resolved rows',rows:[
    {champ:'Malphite',role:'Baron',wr:55.18,pr:8.34,br:22.93},
    {champ:'Smolder',role:'Duo',wr:53.07,pr:10.46,br:11.93},
    {champ:'Syndra',role:'Mid',wr:52.96,pr:12.13,br:19.20},
    {champ:'Yone',role:'Baron',wr:51.76,pr:5.83,br:12.85},
    {champ:'Ahri',role:'Mid',wr:51.20,pr:4.91,br:.19},
    {champ:'Ezreal',role:'Duo',wr:51.19,pr:11.43,br:.88},
    {champ:'Yunara',role:'Duo',wr:51.19,pr:11.13,br:11.79},
    {champ:'Amumu',role:'Jungle',wr:55.59,pr:2.86,br:.08}
  ]},
  curated:{source:'WildRiftFire Tier List · iTzSTU4RT',url:'https://www.wildriftfire.com/tier-list',patch:'7.2e',splus:['Syndra','Ahri','Yunara','Smolder','Ezreal','Malphite','Yone']}
};
const badge=(text,type)=>`<span class="badge ${type||'blue'}">${esc(text)}</span>`;
function champMini(name,body,right=''){return `<article class="meta-champ-row"><div class="meta-avatar">${portraitHTML(name,'meta-portrait')}</div><div><b>${esc(name)}</b><span>${body}</span></div>${right?`<strong>${right}</strong>`:''}</article>`;}
export function metaIntelligenceHTML(){const m=META_SNAPSHOT,comp=OPEN_SERIES_SNAPSHOT.summary;return `<div class="meta-intelligence">
  <section class="meta-hero card"><div><span class="eyebrow">META INTELLIGENCE · ${m.patch.version}</span><h2>Quatro lentes. Uma decisão.</h2><p>Patch oficial, ranqueada CN, curadoria e competitivo não são a mesma coisa. O FROMBOS mantém cada camada separada e só cria síntese quando contexto e evidência permitem.</p></div><div class="meta-stamp"><b>${m.patch.version}</b><span>snapshot ${m.retrievedAt}</span></div></section>
  <div class="meta-lenses">
    <section class="card meta-lens official"><div class="meta-lens-head"><div><span class="eyebrow">RIOT OFFICIAL</span><h3>O que mudou</h3></div>${badge('PATCH','green')}</div><p class="muted">Mudança oficial não significa automaticamente subir/descer de tier.</p><div class="meta-list">${m.patch.changes.map(x=>champMini(x.champ,esc(x.note),`<span class="meta-direction ${x.direction.toLowerCase()}">${x.direction}</span>`)).join('')}</div><a class="meta-source" href="${m.patch.url}" target="_blank" rel="noreferrer">Notas oficiais 7.2e ↗</a></section>
    <section class="card meta-lens observed"><div class="meta-lens-head"><div><span class="eyebrow">OBSERVED RANKED · CN</span><h3>Performance observada</h3></div>${badge('CN','blue')}</div><p class="muted">Win/pick/ban da tabela pública 7.2e. Região e role importam.</p><div class="meta-stat-table"><div class="mst-head"><span>Campeão</span><span>Role</span><span>WR</span><span>Pick</span><span>Ban</span></div>${m.cn.rows.map(x=>`<div class="mst-row"><b>${esc(x.champ)}</b><span>${esc(x.role)}</span><span>${x.wr.toFixed(2)}%</span><span>${x.pr.toFixed(2)}%</span><span>${x.br.toFixed(2)}%</span></div>`).join('')}</div><a class="meta-source" href="${m.cn.url}" target="_blank" rel="noreferrer">WildRiftFire Stats ↗</a></section>
    <section class="card meta-lens curated"><div class="meta-lens-head"><div><span class="eyebrow">CURATED</span><h3>Tier editorial</h3></div>${badge('OPINIÃO CURADA','gold')}</div><p class="muted">A tier list 7.2e é uma leitura de especialista, não uma estatística oficial.</p><div class="curated-grid">${m.curated.splus.map(x=>`<div class="curated-pick"><div>${portraitHTML(x,'meta-portrait')}</div><b>${esc(x)}</b><span>S+</span></div>`).join('')}</div><a class="meta-source" href="${m.curated.url}" target="_blank" rel="noreferrer">Tier List 7.2e ↗</a></section>
    <section class="card meta-lens competitive"><div class="meta-lens-head"><div><span class="eyebrow">OBSERVED COMPETITIVE</span><h3>Open Series</h3></div>${badge('TORNEIO','red')}</div><p class="muted">Competitivo mede prioridade e execução em outro ambiente. O snapshot atual cobre resultados e rankings; pick/ban detalhado entra na próxima ingestão.</p><div class="competitive-mini-kpis"><div><b>${comp.games}</b><span>jogos</span></div><div><b>${comp.championsUsed}</b><span>campeões</span></div><div><b>${comp.avgDuration}</b><span>duração</span></div></div><button class="btn" id="metaOpenCompetitive">Abrir Competitive Center</button></section>
  </div>
  <section class="card meta-synthesis"><div><span class="eyebrow">FROMBOS SYNTHESIS</span><h3>Como interpretar divergência</h3></div><div class="synthesis-grid"><article><b>Malphite</b><p>Recebeu buff oficial e aparece forte no snapshot CN. Isso aumenta o sinal, mas ainda não prova prioridade competitiva no mesmo patch.</p></article><article><b>Vi</b><p>Foi nerfada oficialmente; qualquer histórico competitivo anterior ao 7.2e precisa ser marcado como contexto pré-mudança, não como estado atual.</p></article><article><b>Tier ≠ WR</b><p>Um campeão pode ser S+ por flexibilidade, segurança ou carry potential sem liderar win rate observado. A IA deve explicar qual lente está usando.</p></article><article><b>UNKNOWN é válido</b><p>Se não houver snapshot compatível de role/região/patch ou draft competitivo detalhado, não completar a resposta por memória.</p></article></div></section>
</div>`;}
export function bindMetaIntelligence(){document.querySelector('#metaOpenCompetitive')?.addEventListener('click',()=>location.hash='#/competitive');}
