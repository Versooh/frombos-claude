export const OPEN_SERIES_RESULTS_META={source:'Open Series',type:'OBSERVED_COMPETITIVE',retrievedAt:'2026-09-14',url:'https://www.openseries.com.br/tabelas/',coverage:12,notes:'Fallback snapshot. Deploy refreshes all publicly listed group match results. Source page does not expose match dates or draft sequence.'};
export const OPEN_SERIES_MATCHES=[
{id:'gE-1',group:'GRUPO E',teamA:'Avengers',scoreA:0,scoreB:1,teamB:'MyBad eSports'},
{id:'gE-2',group:'GRUPO E',teamA:'Aquarianos Natos',scoreA:0,scoreB:1,teamB:'MyBad eSports'},
{id:'gE-3',group:'GRUPO E',teamA:'MyBad eSports',scoreA:1,scoreB:0,teamB:'RRE BAGRES'},
{id:'gE-4',group:'GRUPO E',teamA:'MyBad eSports',scoreA:1,scoreB:0,teamB:'Avengers'},
{id:'gE-5',group:'GRUPO E',teamA:'MyBad eSports',scoreA:1,scoreB:0,teamB:'Aquarianos Natos'},
{id:'gE-6',group:'GRUPO E',teamA:'RRE BAGRES',scoreA:0,scoreB:1,teamB:'MyBad eSports'},
{id:'gG-1',group:'GRUPO G',teamA:'Full House Gaming',scoreA:2,scoreB:0,teamB:'Project Phoenix'},
{id:'gG-2',group:'GRUPO G',teamA:'Full House Gaming',scoreA:1,scoreB:0,teamB:'Manolos'},
{id:'gG-3',group:'GRUPO G',teamA:'Full House Gaming',scoreA:1,scoreB:0,teamB:'Lápis Lazuli'},
{id:'gG-4',group:'GRUPO G',teamA:'Project Phoenix',scoreA:1,scoreB:0,teamB:'Full House Gaming'},
{id:'gG-5',group:'GRUPO G',teamA:'Manolos',scoreA:0,scoreB:1,teamB:'Full House Gaming'},
{id:'gG-6',group:'GRUPO G',teamA:'Lápis Lazuli',scoreA:0,scoreB:1,teamB:'Full House Gaming'}
];
export const matchesForTeam=team=>OPEN_SERIES_MATCHES.filter(x=>x.teamA===team||x.teamB===team);
export const resultForTeam=(m,team)=>{const own=m.teamA===team?m.scoreA:m.scoreB,opp=m.teamA===team?m.scoreB:m.scoreA;return own>opp?'W':own<opp?'L':'D';};
