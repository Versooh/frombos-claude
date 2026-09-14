export const OPEN_SERIES_SCOUTING_META={source:'Open Series',type:'OBSERVED_COMPETITIVE',retrievedAt:'2026-09-14',rankingsUrl:'https://www.openseries.com.br/rankings/',teamsUrl:'https://www.openseries.com.br/equipes/',playersCoverage:7,teamsCoverage:1,notes:'Fallback snapshot. Deploy refreshes public rankings and lineups.'};
export const OPEN_SERIES_PLAYERS=[
{rank:5,name:'MB Leozin#Skilo',team:'MyBad eSports',games:15,winRate:93.3,wins:14,losses:1,kda:9.88,totalK:30,totalD:24,totalA:207,avgGold:'9.782',favorite:'Bard'},
{rank:7,name:'GZ Pedro#Gabs',team:'MyBad eSports',games:2,winRate:100,wins:2,losses:0,kda:8.67,totalK:6,totalD:3,totalA:20,avgGold:'10.141',favorite:'Poppy'},
{rank:16,name:'MB Dell#xisL',team:'MyBad eSports',games:15,winRate:93.3,wins:14,losses:1,kda:6.56,totalK:71,totalD:25,totalA:93,avgGold:'13.641',favorite:'Gwen'},
{rank:18,name:'MB Unskilled#leleo',team:'MyBad eSports',games:14,winRate:92.9,wins:13,losses:1,kda:6.19,totalK:85,totalD:27,totalA:82,avgGold:'13.458',favorite:'Varus'},
{rank:19,name:'MB Fenix#666',team:'MyBad eSports',games:15,winRate:93.3,wins:14,losses:1,kda:6.16,totalK:63,totalD:25,totalA:91,avgGold:'12.853',favorite:'Aatrox'},
{rank:1,name:'FHG Aomine#Zone',team:'Full House Gaming',games:15,winRate:66.7,wins:10,losses:5,kda:15.38,totalK:55,totalD:8,totalA:68,avgGold:'16.404',favorite:'Jhin'},
{rank:23,name:'AL Gun#miuuy',team:'Alianca Unlucky',games:24,winRate:66.7,wins:16,losses:8,kda:5.60,totalK:106,totalD:55,totalA:202,avgGold:'13.824',favorite:'Lee Sin'}
];
export const OPEN_SERIES_LINEUPS={'MyBad eSports':['GZ Pedro#Gabs','MB Boki#Clara','MB Dell#xisL','MB Fenix#666','MB Leozin#Skilo','MB Unskilled#leleo']};
export const playersForTeam=team=>OPEN_SERIES_PLAYERS.filter(x=>x.team===team).sort((a,b)=>a.rank-b.rank);
export const lineupForTeam=team=>OPEN_SERIES_LINEUPS[team]||[];
