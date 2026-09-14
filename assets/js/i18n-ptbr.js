const REPLACEMENTS = [
  ['Competitive Intelligence Platform','Plataforma de Inteligência Competitiva'],
  ['Competitive Intelligence','Inteligência Competitiva'],
  ['Competitive Platform','Plataforma Competitiva'],
  ['Command Center','Central de Comando'],
  ['Team Workspace','Espaço da Equipe'],
  ['Composition Lab','Laboratório de Composições'],
  ['Draft Room Pro','Sala de Draft Pro'],
  ['Draft Room','Sala de Draft'],
  ['Tournament Draft','Draft de Torneio'],
  ['Tactical Board 2.0','Prancheta Tática 2.0'],
  ['Tactical Board','Prancheta Tática'],
  ['VOD Review','Revisão de VOD'],
  ['Matchup Lab','Laboratório de Confrontos'],
  ['Build Intelligence','Inteligência de Builds'],
  ['Series Intelligence','Inteligência de Série'],
  ['Performance Center','Centro de Performance'],
  ['Data Center','Central de Dados'],
  ['Champions','Campeões'],
  ['Scouting','Análise de Adversários'],
  ['TEAM WORKSPACE','ESPAÇO DA EQUIPE'],
  ['COMPOSITION LAB','LABORATÓRIO DE COMPOSIÇÕES'],
  ['DRAFT ROOM PRO','SALA DE DRAFT PRO'],
  ['TACTICAL BOARD 2.0','PRANCHETA TÁTICA 2.0'],
  ['VOD REVIEW','REVISÃO DE VOD'],
  ['SERIES INTELLIGENCE','INTELIGÊNCIA DE SÉRIE'],
  ['PERFORMANCE CENTER','CENTRO DE PERFORMANCE'],
  ['DATA CENTER','CENTRAL DE DADOS'],
  ['LOCAL WORKSPACE','ESPAÇO LOCAL'],
  ['Workspace local-first.','Espaço de trabalho local e persistente.'],
  ['WORKSPACE','ESPAÇO DE TRABALHO'],
  ['BLUE SIDE','LADO AZUL'],
  ['RED SIDE','LADO VERMELHO'],
  ['CHAMPION SELECT','SELEÇÃO DE CAMPEÕES'],
  ['BRANCHES','PLANOS ALTERNATIVOS'],
  ['Branch','Plano'],
  ['branch','plano alternativo'],
  ['Ruleset','Regulamento'],
  ['Custom','Personalizado'],
  ['BLUE','AZUL'],
  ['RED','VERMELHO'],
  ['PICKS','ESCOLHAS'],
  ['PICK','ESCOLHA'],
  ['BANS','BANIMENTOS'],
  ['BAN','BANIMENTO'],
  ['PLAYER FIT','ADEQUAÇÃO À POOL'],
  ['FEARLESS · USED','FEARLESS · USADO'],
  ['USED / INDISPONÍVEL','USADO / INDISPONÍVEL'],
  ['COACH VIEW','VISÃO DO TREINADOR'],
  ['Win condition','Condição de vitória'],
  ['Strong side','Lado forte'],
  ['Cross-map','Mapa cruzado'],
  ['Herald','Arauto'],
  ['Invade','Invasão'],
  ['Trade','Troca'],
  ['Early','Início'],
  ['Scaling','Escala'],
  ['Engage','Iniciação'],
  ['Front-to-back','Frente para trás'],
  ['Peel','Proteção'],
  ['Split','Pressão lateral'],
  ['Wombo','Combo em área'],
  ['board de análise','prancheta de análise'],
  ['Provenance & fontes','Proveniência e fontes'],
  ['Provenance','Proveniência'],
  ['roster','elenco'],
  ['patch tracker','rastreamento de patch'],
  ['system changes','mudanças de sistema'],
  ['observed competitive/ranked data','dados competitivos/ranqueados observados'],
  ['draft structure','estrutura de draft'],
  ['composition structure','estrutura de composição'],
  ['contextual reasoning','leitura contextual'],
  ['planned','planejado'],
  ['recovery','recuperação'],
  ['foundation','fundação'],
  ['OFFICIAL','OFICIAL'],
  ['OBSERVED','OBSERVADO'],
  ['CURATED','CURADO'],
  ['FROMBOS_STRUCTURAL','ESTRUTURAL FROMBOS'],
  ['USER_PRIVATE','PRIVADO DA EQUIPE'],
  ['UNKNOWN','DESCONHECIDO'],
  ['RECOVERED_TRAINING_PROPOSAL','PROPOSTA DE TREINO RECUPERADA'],
  ['WILD RIFT','WILD RIFT'],
  ['Game ','Jogo '],
  [' actions registered',' ações registradas'],
  ['Win condition:','Condição de vitória:'],
  ['REBUILD ATIVO','RECONSTRUÇÃO ATIVA'],
  ['CORE','NÚCLEO'],
  ['SYSTEM','SISTEMA']
].sort((a,b)=>b[0].length-a[0].length);

const ATTRS=['title','placeholder','aria-label'];

function translateString(value){
  if(!value) return value;
  let out=value;
  for(const [from,to] of REPLACEMENTS) out=out.split(from).join(to);
  return out;
}

function translateTextNode(node){
  if(!node.nodeValue?.trim()) return;
  const parent=node.parentElement;
  if(!parent || ['SCRIPT','STYLE','CODE','PRE'].includes(parent.tagName)) return;
  const next=translateString(node.nodeValue);
  if(next!==node.nodeValue) node.nodeValue=next;
}

function translateElement(el){
  if(!(el instanceof Element)) return;
  for(const attr of ATTRS){
    const value=el.getAttribute(attr);
    if(value){
      const next=translateString(value);
      if(next!==value) el.setAttribute(attr,next);
    }
  }
  if(el.tagName==='OPTION'){
    const rawValue=el.value;
    const hadExplicitValue=el.hasAttribute('value');
    const next=translateString(el.textContent);
    if(next!==el.textContent){
      el.textContent=next;
      if(!hadExplicitValue) el.value=rawValue;
    }
  }
}

function localize(root=document.body){
  if(!root) return;
  if(root.nodeType===Node.TEXT_NODE){ translateTextNode(root); return; }
  translateElement(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.nodeType===Node.TEXT_NODE) translateTextNode(node);
    else translateElement(node);
  }
  document.documentElement.lang='pt-BR';
  document.title='FROMBOS — Inteligência Competitiva para Wild Rift';
}

let queued=false;
const queueLocalize=()=>{
  if(queued) return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;localize();});
};

new MutationObserver(queueLocalize).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',queueLocalize,{once:true});
else queueLocalize();

window.FROMBOS_PTBR={localize,translateString};
