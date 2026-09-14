export const MODULES = [
  { id: 'home', label: 'Command Center', group: 'CORE', icon: '✦' },
  { id: 'team', label: 'Meu time & pools', group: 'PREPARAÇÃO', icon: '◈' },
  { id: 'comps', label: 'Composições', group: 'PREPARAÇÃO', icon: '⬡' },
  { id: 'draft', label: 'Draft Room', group: 'COMPETIÇÃO', icon: '⚑' },
  { id: 'series', label: 'Fearless / Série', group: 'COMPETIÇÃO', icon: '≋' },
  { id: 'tactical', label: 'Tactical Board', group: 'ANÁLISE', icon: '◎' },
  { id: 'vod', label: 'VOD Review', group: 'ANÁLISE', icon: '▶' },
  { id: 'champions', label: 'Champions', group: 'INTELIGÊNCIA', icon: '◇' },
  { id: 'matchups', label: 'Matchup Lab', group: 'INTELIGÊNCIA', icon: '⇄' },
  { id: 'builds', label: 'Build Intelligence', group: 'INTELIGÊNCIA', icon: '▦' },
  { id: 'scouting', label: 'Scouting', group: 'PREPARAÇÃO', icon: '⌖' },
  { id: 'training', label: 'Treinos', group: 'EVOLUÇÃO', icon: '↗' },
  { id: 'reports', label: 'Relatórios', group: 'EVOLUÇÃO', icon: '▥' },
  { id: 'competitive', label: 'Competitivo', group: 'INTELIGÊNCIA', icon: '♜' },
  { id: 'data', label: 'Data Center', group: 'SISTEMA', icon: '⌁' },
  { id: 'settings', label: 'Configurações', group: 'SISTEMA', icon: '⚙' }
];
export const ROLES=[{id:'BARON',label:'Barão'},{id:'JUNGLE',label:'Selva'},{id:'MID',label:'Meio'},{id:'DUO',label:'Duo'},{id:'SUPPORT',label:'Suporte'}];
export const CHAMPIONS=['Aatrox','Ahri','Akali','Akshan','Alistar','Ambessa','Amumu','Annie','Ashe','Aurelion Sol','Aurora','Bard','Blitzcrank','Brand','Braum','Caitlyn','Camille','Cho\'Gath','Corki','Darius','Diana','Dr. Mundo','Draven','Ekko','Evelynn','Ezreal','Fiddlesticks','Fiora','Fizz','Galio','Garen','Gnar','Gragas','Graves','Gwen','Hecarim','Heimerdinger','Irelia','Janna','Jarvan IV','Jax','Jayce','Jhin','Jinx','K\'Sante','Kai\'Sa','Kalista','Karma','Kassadin','Katarina','Kayle','Kayn','Kennen','Kha\'Zix','Kindred','Kog\'Maw','Lee Sin','Leona','Lillia','Lissandra','Lucian','Lulu','Lux','Malphite','Maokai','Master Yi','Mel','Milio','Miss Fortune','Mordekaiser','Morgana','Nami','Nasus','Nautilus','Nidalee','Nilah','Nocturne','Norra','Nunu & Willump','Olaf','Orianna','Ornn','Pantheon','Poppy','Pyke','Rakan','Rammus','Rell','Renekton','Rengar','Riven','Rumble','Ryze','Samira','Senna','Seraphine','Sett','Shen','Shyvana','Singed','Sion','Sivir','Skarner','Smolder','Sona','Soraka','Swain','Syndra','Taliyah','Talon','Teemo','Thresh','Tristana','Tryndamere','Twisted Fate','Twitch','Urgot','Varus','Vayne','Veigar','Vel\'Koz','Vex','Vi','Viego','Viktor','Vladimir','Volibear','Warwick','Wukong','Xayah','Xin Zhao','Yasuo','Yone','Yunara','Yuumi','Zed','Zeri','Ziggs','Zilean','Zoe','Zyra'];
export const RECOVERED_COMPOSITIONS=[
{id:'engage-layers',name:'Aperta o R e vai junto',archetype:'Engage em camadas',origin:'RECOVERED_TRAINING_PROPOSAL',patch:'7.2e editorial baseline',lineup:{BARON:'Malphite',JUNGLE:'Wukong',MID:'Orianna',DUO:'Xayah',SUPPORT:'Rakan'},plan:'Duas entradas, dano em área e uma dupla que consegue acompanhar o ritmo.',winCondition:'Forçar lutas agrupadas em janelas de objetivo e encadear iniciação com controle em área.'},
{id:'protect-carry',name:'Operação: carry vivo',archetype:'Proteção e escala',origin:'RECOVERED_TRAINING_PROPOSAL',patch:'7.2e editorial baseline',lineup:{BARON:'Ornn',JUNGLE:'Xin Zhao',MID:'Orianna',DUO:'Jinx',SUPPORT:'Lulu'},plan:'Frontline, controle e proteção para a Jinx converter as lutas longas.',winCondition:'Estender lutas, preservar o carry e jogar em torno de frontline + peel.'},
{id:'siege-range',name:'Sem vida, sem dragão',archetype:'Cerco e alcance',origin:'RECOVERED_TRAINING_PROPOSAL',patch:'7.2e editorial baseline',lineup:{BARON:'Jayce',JUNGLE:'Gragas',MID:'Ziggs',DUO:'Ezreal',SUPPORT:'Karma'},plan:'Alcance e cerco. A vitória começa antes de alguém entrar no fosso.',winCondition:'Criar vantagem de vida e espaço antes do objetivo e evitar entrada frontal sem setup.'},
{id:'side-catch',name:'Sumiu? Já rotacionou.',archetype:'Lateral e captura',origin:'RECOVERED_TRAINING_PROPOSAL',patch:'7.2e editorial baseline',lineup:{BARON:'Camille',JUNGLE:'Lee Sin',MID:'Galio',DUO:'Ezreal',SUPPORT:'Nautilus'},plan:'Captura coordenada com pressão lateral e um ADC autossuficiente.',winCondition:'Abrir mapa pela lateral, criar superioridade numérica e converter pick em objetivo.'},
{id:'snowball-address',name:'Bola de neve com endereço',archetype:'Engage em camadas',origin:'RECOVERED_TRAINING_PROPOSAL',patch:'7.2e editorial baseline',lineup:{BARON:'Renekton',JUNGLE:'Jarvan IV',MID:'Galio',DUO:'Lucian',SUPPORT:'Nami'},plan:'Pressão em duas lanes e uma rota de jungle orientada ao primeiro recurso.',winCondition:'Acelerar cedo, conectar prioridade de rota à jungle e negar estabilização adversária.'},
{id:'anti-engage',name:'Vem que tem resposta',archetype:'Proteção e escala',origin:'RECOVERED_TRAINING_PROPOSAL',patch:'7.2e editorial baseline',lineup:{BARON:'Gwen',JUNGLE:'Poppy',MID:'Orianna',DUO:'Xayah',SUPPORT:'Janna'},plan:'Anti-engage e dano contra frontline, com ameaça de Gwen na lateral.',winCondition:'Negar a primeira entrada, preservar cooldowns defensivos e ganhar espaço depois do engage inimigo.'}
];
export const DATA_SOURCES=[
{id:'riot',name:'Riot Official',type:'OFFICIAL',status:'active',domains:['roster','champion assets','patch','skills','system changes']},
{id:'openseries',name:'Open Series',type:'OBSERVED_COMPETITIVE',status:'active snapshot · 2026-09-14',domains:['tournament summary','teams','groups','rankings']},
{id:'riftgg',name:'RiftGG',type:'OBSERVED',status:'recovery',domains:['matchups','observed competitive/ranked data']},
{id:'wildriftfire',name:'WildRiftFire',type:'CURATED',status:'planned',domains:['tiers','builds','runes','guides']},
{id:'wildlegends',name:'Wild Legends',type:'CURATED',status:'planned',domains:['tiers','patch tracker','guides']},
{id:'frombos',name:'FROMBOS Structural',type:'FROMBOS_STRUCTURAL',status:'foundation',domains:['draft structure','composition structure','contextual reasoning']}
];
// FROMBOS tournament ruleset requested by the project: every action alternates side.
// It is intentionally labeled as a FROMBOS ruleset until a specific official tournament ruleset is verified and versioned.
export const DRAFT_ORDER=[
['blue','ban'],['red','ban'],['blue','ban'],['red','ban'],['blue','ban'],['red','ban'],
['blue','pick'],['red','pick'],['blue','pick'],['red','pick'],['blue','pick'],['red','pick'],
['blue','ban'],['red','ban'],['blue','ban'],['red','ban'],
['blue','pick'],['red','pick'],['blue','pick'],['red','pick']
];
