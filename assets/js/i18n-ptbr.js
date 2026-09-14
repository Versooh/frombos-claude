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
  ['VOD Review Pro','Revisão de VOD Pro'],
  ['VOD REVIEW PRO','REVISÃO DE VOD PRO'],
  ['VOD Review','Revisão de VOD'],
  ['VOD REVIEW','REVISÃO DE VOD'],
  ['Champion Intelligence','Inteligência de Campeões'],
  ['CHAMPION INTELLIGENCE','INTELIGÊNCIA DE CAMPEÕES'],
  ['Meta Intelligence','Inteligência de Meta'],
  ['META INTELLIGENCE','INTELIGÊNCIA DE META'],
  ['Matchup Lab','Laboratório de Confrontos'],
  ['MATCHUP LAB','LABORATÓRIO DE CONFRONTOS'],
  ['Build Intelligence','Inteligência de Builds'],
  ['BUILD INTELLIGENCE','INTELIGÊNCIA DE BUILDS'],
  ['Series Intelligence','Inteligência de Série'],
  ['SERIES INTELLIGENCE','INTELIGÊNCIA DE SÉRIE'],
  ['Performance Center','Centro de Performance'],
  ['PERFORMANCE CENTER','CENTRO DE PERFORMANCE'],
  ['Data Center','Central de Dados'],
  ['DATA CENTER','CENTRAL DE DADOS'],
  ['Champions','Campeões'],
  ['Scouting','Análise de Adversários'],
  ['Coach Mode','Modo Treinador'],
  ['COACH MODE','MODO TREINADOR'],
  ['TEAM WORKSPACE','ESPAÇO DA EQUIPE'],
  ['COMPOSITION LAB','LABORATÓRIO DE COMPOSIÇÕES'],
  ['DRAFT ROOM PRO','SALA DE DRAFT PRO'],
  ['TACTICAL BOARD 2.0','PRANCHETA TÁTICA 2.0'],
  ['LOCAL WORKSPACE','ESPAÇO LOCAL'],
  ['competitive workspace','espaço competitivo'],
  ['evidence first','evidência em primeiro lugar'],
  ['Evidence first','Evidência em primeiro lugar'],
  ['Workspace local-first.','Espaço de trabalho local e persistente.'],
  ['WORKSPACE','ESPAÇO DE TRABALHO'],
  ['BLUE SIDE','LADO AZUL'],
  ['RED SIDE','LADO VERMELHO'],
  ['CHAMPION SELECT','SELEÇÃO DE CAMPEÕES'],
  ['BRANCHES','PLANOS ALTERNATIVOS'],
  ['Branches','Planos alternativos'],
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
  ['Win Condition','Condição de vitória'],
  ['Strong side','Lado forte'],
  ['Cross-map','Mapa cruzado'],
  ['Herald','Arauto'],
  ['Invade','Invasão'],
  ['Trade','Troca'],
  ['Early Game','Início de jogo'],
  ['Mid Game','Meio de jogo'],
  ['Late Game','Fim de jogo'],
  ['Early','Início'],
  ['Scaling','Escala'],
  ['Engage','Iniciação'],
  ['Front-to-back','Frente para trás'],
  ['Peel','Proteção'],
  ['Split Push','Pressão lateral'],
  ['Split','Pressão lateral'],
  ['Wombo Combo','Combo em área'],
  ['Wombo','Combo em área'],
  ['Poke','Pressão à distância'],
  ['Dive','Mergulho'],
  ['Pick-off','Captura'],
  ['Pick','Captura'],
  ['Zone','Controle de zona'],
  ['board de análise','prancheta de análise'],
  ['Provenance & fontes','Proveniência e fontes'],
  ['Provenance','Proveniência'],
  ['Observed data','Dados observados'],
  ['observed data','dados observados'],
  ['Observed','Observado'],
  ['Structural read','Leitura estrutural'],
  ['structural read','leitura estrutural'],
  ['Champion pool','Pool de campeões'],
  ['champion pool','pool de campeões'],
  ['Roster visual','Elenco visual'],
  ['roster','elenco'],
  ['Champion assets','Recursos de campeões'],
  ['champion assets','recursos de campeões'],
  ['patch tracker','rastreamento de patch'],
  ['system changes','mudanças de sistema'],
  ['tournament summary','resumo do torneio'],
  ['teams','equipes'],
  ['groups','grupos'],
  ['rankings','classificações'],
  ['CN ranked stats','estatísticas ranqueadas CN'],
  ['observed competitive/ranked data','dados competitivos/ranqueados observados'],
  ['draft structure','estrutura de draft'],
  ['composition structure','estrutura de composição'],
  ['contextual reasoning','leitura contextual'],
  ['active snapshot','snapshot ativo'],
  ['active','ativo'],
  ['planned','planejado'],
  ['recovery','recuperação'],
  ['foundation','fundação'],
  ['OFFICIAL','OFICIAL'],
  ['OBSERVED_COMPETITIVE','COMPETITIVO OBSERVADO'],
  ['OBSERVED_CN + CURATED','OBSERVADO CN + CURADO'],
  ['OBSERVED_CN','OBSERVADO CN'],
  ['OBSERVED','OBSERVADO'],
  ['CURATED','CURADO'],
  ['FROMBOS_STRUCTURAL','ESTRUTURAL FROMBOS'],
  ['USER_PRIVATE','PRIVADO DA EQUIPE'],
  ['UNKNOWN','DESCONHECIDO'],
  ['RECOVERED_TRAINING_PROPOSAL','PROPOSTA DE TREINO RECUPERADA'],
  ['WILD RIFT ONLY','SOMENTE WILD RIFT'],
  ['Game ','Jogo '],
  ['GAME ','JOGO '],
  [' actions registered',' ações registradas'],
  ['Picks:','Escolhas:'],
  ['Win condition:','Condição de vitória:'],
  ['REBUILD ATIVO','RECONSTRUÇÃO ATIVA'],
  ['CORE','NÚCLEO'],
  ['SYSTEM','SISTEMA'],
  ['Reset local','Redefinição local'],
  ['Resetar o workspace','Redefinir o espaço de trabalho'],
  ['workspace local','espaço de trabalho local'],
  ['workspace','espaço de trabalho'],
  ['drills','exercícios'],
  ['Drills','Exercícios'],
  ['DRILLS','EXERCÍCIOS'],
  ['timestamps','marcações de tempo'],
  ['timestamp','marcação de tempo'],
  ['portraits oficiais','retratos oficiais'],
  ['portraits','retratos'],
  ['portrait','retrato']
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
