# FROMBOS — Wild Rift Coaching Playbook

## Purpose

This playbook converts public Wild Rift coaching material, Riot esports interviews, VOD-analysis practice and community knowledge into a coaching model that can be encoded into FROMBOS.

The goal is not to make the AI sound like a coach. The goal is to make it reason through the same decision chain a good coach reviews: **information → wave → tempo → vision → numbers → objective → execution → conversion**.

The content in this document is Wild Rift-specific. League PC concepts may be used only as abstract MOBA concepts after explicit Wild Rift validation; no League PC item, map, timing, champion-state or ward mechanic may silently enter production data.

---

## 1. The coaching lens: review the decision before the visible mistake

Across Wild Rift coaching material, a recurring principle is that the fight where a game is lost is often only the visible end of an earlier mistake. Review should rewind roughly 30–60 seconds and inspect:

- wave state;
- recall timing;
- unspent gold;
- health/mana;
- jungle path;
- last enemy jungle reveal;
- lane priority;
- vision ownership;
- missing enemies;
- objective timer;
- available ultimates/summoners;
- numbers that can arrive first;
- intended reward if the play succeeds.

This must become the default FROMBOS VOD workflow.

### AI review contract

Instead of:

> “You lost the dragon fight because the engage was bad.”

Prefer:

> “The engage was the final error. The position became losing earlier: mid wave was not pushed, your jungler recalled after the objective became urgent, and your team entered river through enemy vision. Review begins at T-45s, not at the engage.”

Primary coaching references:

- https://wildriftcoaching.com/wild-rift-macro-coaching.html
- https://wildriftcoaching.com/objective-control-wild-rift.html
- https://wildriftcoaching.com/wild-rift-coaching-session-guide.html

---

## 2. Macro decision model

Every meaningful macro decision can be decomposed into seven checks.

### 2.1 Information

What do we actually know?

- enemy positions;
- last jungle reveal;
- missing lanes;
- wards seen/cleared;
- cooldowns used;
- objective timers;
- death timers;
- item completions;
- visible waves.

Unknown information must remain unknown. The AI must not pretend a missing jungler is on one side without evidence.

### 2.2 Wave

Before moving, ask:

- Is the nearest lane pushed?
- Who loses the wave if we move?
- Does the wave create priority?
- Does the side wave force an answer?
- Will the wave crash during the objective window?

A rotation that destroys two waves for no concrete reward may be worse than staying.

### 2.3 Tempo

Tempo is time advantage.

Sources of tempo:

- faster clear;
- earlier reset;
- spending gold first;
- pushing wave first;
- forcing an enemy recall;
- completing a move while the opponent must answer something else.

A kill that destroys the next objective setup can have negative strategic value.

### 2.4 Vision

Vision should answer a question, not merely increase ward count.

Examples:

- “Can enemy jungle enter dragon from this route?”
- “Can our side laner safely cross river?”
- “Can the enemy flank our ADC?”
- “Did they see our Baron start?”

### 2.5 Numbers

Count who can actually arrive.

A nearby 4v3 can be winning even when total team gold is lower. A theoretical 5v5 is irrelevant if two players cannot reach the fight.

### 2.6 Objective

Every fight should have a reward.

Possible rewards:

- Dragon;
- Herald;
- Baron;
- Elder;
- tower;
- inhibitor pressure;
- enemy jungle camps;
- deep vision;
- reset timing;
- side-wave pressure.

If the answer to “what do we gain?” is unclear, the fight may be low value.

### 2.7 Conversion / exit

After winning:

- take the reward;
- reset before overextending;
- do not convert a won fight into a lost shutdown;
- identify what the next wave/objective becomes.

---

## 3. Objective setup timeline

A practical baseline from current Wild Rift coaching material:

### T-60s

- identify which objective matters;
- inspect side waves;
- identify enemy jungle side / last reveal;
- check item gold and health;
- decide whether the team can realistically contest.

### T-45s

- reset players who need items/health/mana;
- jungle finishes the final relevant camp rather than beginning a long detour;
- side lane begins creating the desired wave state.

### T-30s

- push or secure mid priority if possible;
- enter the relevant river/jungle as a group;
- place useful wards;
- sweep enemy vision;
- identify flank routes.

### T-15s

Make an explicit call:

- START;
- BAIT;
- TURN;
- CONTEST;
- GIVE;
- TRADE CROSS-MAP.

Do not arrive at objective spawn with no decision.

Reference:
- https://wildriftcoaching.com/objective-control-wild-rift.html

---

## 4. Vision and warding curriculum

### 4.1 Current Wild Rift ward model

Wild Rift uses trinket-based vision. Current reference mechanics include:

**Warding Totem**
- stealth ward;
- 90s vision duration;
- 120s recharge;
- up to 2 charges;
- up to 2 deployed stealth wards per player.

**Control Ward**
- trinket option, not a League-PC-style shop purchase;
- visible;
- reveals enemy wards, stealthed traps and camouflaged champions;
- persists until destroyed/replaced;
- one deployed per player;
- current reference cooldown: 100s.

**Sweeping Lens**
- scans around the user;
- reveals wards/traps and disables stealth wards;
- 10s duration;
- current reference cooldown: 75s.

Official history/reference:
- https://wildrift.leagueoflegends.com/en-gb/news/game-updates/wild-rift-patch-notes-3-2/
- https://wiki.leagueoflegends.com/en-us/WR:Warding_Totem
- https://wiki.leagueoflegends.com/en-us/WR:Control_Ward
- https://wiki.leagueoflegends.com/en-us/WR:Sweeping_Lens

Patch 7.2 also added visible Vision Score to the scoreboard, reinforcing vision as a measurable game contribution:
- https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-2/

### 4.2 Purpose-based warding

A ward must protect or enable the next decision.

**Defensive state**
- ward entrances used to dive/collapse;
- protect your jungle access;
- avoid placing deep vision you cannot safely defend.

**Neutral state**
- river intersections;
- objective approaches;
- routes that reveal rotations.

**Aggressive state**
- enemy jungle intersections;
- camp approaches;
- flank routes behind the next objective;
- vision that tracks jungle movement after lane priority is established.

A deep ward placed with no lane priority is often a donation.

### 4.3 Vision before objective

Correct sequence:

1. handle wave;
2. move first;
3. enter with numbers;
4. ward relevant entrances;
5. sweep the area the enemy needs to see;
6. decide start/bait/turn/trade;
7. keep the carry away from face-check duty.

### 4.4 Sweeper timing

Sweeper is strongest **before using darkness as a weapon**:

- before Baron start;
- before hiding for a pick;
- before taking control of river;
- before a turn.

Sweeping after the team has already been seen can be too late.

References:
- https://wildriftcoaching.com/wild-rift-vision-control-guide.html
- https://wildriftcore.com/pt-br/guides/vision-wards-wild-rift/
- https://www.reddit.com/r/wildrift/comments/1mkurnv

### 4.5 FROMBOS Tactical Board implication

Vision markers need:

- ward type;
- placement team;
- visible range circle;
- estimated lifetime state;
- purpose tag: `TRACK`, `DEFEND`, `OBJECTIVE`, `FLANK`, `SIDE`, `PICK`;
- scenario timestamp;
- sweeper path overlay;
- layer toggle.

The board should teach why a ward exists, not only show its location.

---

## 5. Jungle coaching framework

### Three-move rule

Strong jungle planning connects short sequences:

- camp → gank → reset;
- clear → cover → objective;
- invade → exit → cross-map;
- gank → tower → dragon;
- give dragon → Herald → tower.

A jungler should always know the likely next two actions.

### Gank quality checklist

Before ganking:

- lane setup / CC;
- enemy mobility;
- wave position;
- damage to finish;
- enemy jungle location;
- camp opportunity cost;
- objective timer;
- what happens if the gank fails.

### Invade permission

Invade only when the map grants permission:

- nearby priority;
- information on enemy jungle;
- safe entrance;
- safe exit;
- no larger objective sacrificed.

Reference:
- https://wildriftcoaching.com/wild-rift-jungle-pathing-guide.html
- https://wildriftcoaching.com/wild-rift-jungle-tracking-guide.html

---

## 6. Rotation framework

A rotation is good when:

1. wave is handled;
2. path is reasonably safe;
3. reward is explicit.

Bad reason:
> “My team is fighting, so I must go.”

Good reason:
> “Mid is pushed, dragon is T-25s, support and jungle already own the river entrance, and moving creates a 4v3 before their Baron laner arrives.”

Reference:
- https://wildriftcoaching.com/wild-rift-rotation-guide.html

---

## 7. Side lane / split push

Split push is not “stay side forever.”

A useful split requires:

- a wave that threatens something;
- ability to survive or escape the collapse;
- teammates able to gain something while enemies answer.

The side wave should hit at the same time as the relevant map pressure.

Before crossing river, inspect:

- missing enemies;
- known engage tools;
- available escapes;
- objective timer;
- whether the team can pressure mid/Baron/dragon.

Reference:
- https://wildriftcoaching.com/wild-rift-split-push-guide.html

---

## 8. Win-condition coaching

A team must know what it is playing for.

Common win conditions:

- front-to-back around a protected carry;
- pick/catch through darkness;
- split pressure;
- layered engage;
- poke before objective;
- scaling to item spikes;
- early tempo and snowball;
- objective control.

The win condition is dynamic. It depends on:

- draft;
- current gold;
- items;
- summoners;
- who is fed;
- side pressure;
- objective timer.

Reference:
- https://wildriftcoaching.com/wild-rift-win-condition-guide.html

---

## 9. Teamfight coaching

Before the fight, assign jobs.

### Frontline / engager

- create space;
- choose whether to start or hold engage;
- avoid engaging farther than follow-up range;
- identify enemy disengage.

### Secondary engage / follow-up

- chain control after the first action;
- do not duplicate cooldowns unnecessarily.

### Peel

- identify the carry that actually matters in this game;
- preserve control for enemy dive/flank.

### ADC

Core rule: **hit the closest safe target until a better damage window exists**.

Do not walk through frontline to “focus the carry.”

Before objective fights:

- identify flank angles;
- identify enemy engage range;
- track assassin visibility;
- remain near controlled vision.

Reference:
- https://wildriftcoaching.com/wild-rift-adc-positioning-guide.html
- https://wildriftcoaching.com/wild-rift-target-selection-guide.html

---

## 10. Draft coaching framework

Draft is not a tier-list exercise.

### 10.1 Inputs

- tournament rules;
- side;
- series score;
- previous Fearless locks;
- player champion pools;
- opponent champion pools;
- patch;
- current competitive priorities;
- prepared compositions;
- flex champions;
- matchup evidence.

### 10.2 Blind-pick checklist

A strong blind pick needs:

- familiarity;
- a plan for bad lane matchups;
- useful team function even without lane lead;
- independence from constant jungle rescue;
- acceptable counter surface.

Reference:
- https://wildriftcoaching.com/wild-rift-blind-pick-guide.html

### 10.3 Composition debts

At each pick, the FROMBOS engine should track unmet needs:

- frontline;
- engage;
- follow-up;
- peel;
- magic/physical damage balance;
- sustained DPS;
- waveclear;
- objective DPS;
- poke/range;
- side-lane pressure;
- scaling;
- early pressure.

A recommendation that fixes a lane but creates three composition debts can be strategically worse.

### 10.4 Flex value

A flex pick has value because it preserves uncertainty and delays role commitment.

The engine should measure:

- number of credible roles;
- player pool availability for those roles;
- counter exposure after assignment;
- whether the flex remains credible in the actual team.

### 10.5 Player comfort > abstract meta when execution demands it

Riot's historical B4 interview is a strong coaching lesson: the staff studied opponents deeply, while the roster emphasized flexibility and comfort rather than blindly following one meta.

Source:
- https://wildrift.leagueoflegends.com/pt-br/news/esports/estudar-os-concorrentes-e-ser-flexivel-a-receita-da-invicta-b4/

### 10.6 Competitive preparation is opponent-specific

The same B4 interview describes weekly opponent study beginning after the previous round: analyze what the opponent does, discuss champions, then create strategies.

FROMBOS Scouting must therefore feed Draft directly.

---

## 11. Professional coaching lessons from Riot esports interviews

### B4: study the opponent, remain flexible

Lessons:

- preparation should be opponent-specific;
- champion discussion generates strategies;
- adaptability is a competitive asset;
- comfort can outweigh blindly copying meta.

Source:
- https://wildrift.leagueoflegends.com/pt-br/news/esports/estudar-os-concorrentes-e-ser-flexivel-a-receita-da-invicta-b4/

### Vivo Keyd / Blind: macro plans need adaptable execution

The historical “Asian meta” discussion around Vivo Keyd highlights 1-3-1, side-lane pressure and map control, but also a failure mode: a rigid plan breaks when individual decisions force improvisation.

Core lesson:
- strategic structure is valuable;
- players still need micro/macro variation and adaptation;
- fights should exist to convert toward the Nexus, not because fighting is culturally habitual.

Source:
- https://wildrift.leagueoflegends.com/pt-br/news/esports/o-que-e-o-meta-asiatico-e-como-ele-esta-sendo-aplicado-no-wild-tour/

### Vivo Keyd / Maynah: VOD study can change a series plan

Before playoffs, Maynah reportedly reviewed international Wild Rift VODs, identified a strategic concept, tested it in a scrim and changed the team's game plan shortly before the match.

FROMBOS lesson:
- VOD → hypothesis → scrim test → strategy update is a first-class workflow.

Source:
- https://wildrift.leagueoflegends.com/pt-br/news/esports/eureca-vivo-keyd-muda-tatica-12-horas-antes-do-inicio-dos-playoffs/

### Ranker / Los Grandes: intelligent aggression

“Playing at the limit” is not random risk. It is knowing the maximum action the current state permits.

FROMBOS lesson:
- aggression evaluation requires state, not personality labels;
- the AI should distinguish `CALCULATED_FORCE` from `LOW_INFORMATION_FORCE`.

Source:
- https://wildrift.leagueoflegends.com/pt-br/news/esports/ranker-o-shotcaller-da-los-grandes/

### Miners: visual draft preparation

A Riot article describes a physical whiteboard and champion magnets used to study drafts.

FROMBOS lesson:
- visual manipulation of champions is not cosmetic; it is a learning tool.
- the Draft Room should feel like a digital coaching board, with portraits, branches and scenario comparison.

Source:
- https://wildrift.leagueoflegends.com/pt-br/news/esports/em-familia-miners-busca-titulo-em-casa-contra-tudo-e-contra-todos/

---

## 12. VOD review methodology

For each important event, save:

- timestamp;
- event category;
- map position;
- game state;
- player/role;
- visible information;
- decision made;
- alternatives;
- expected reward;
- result;
- coaching rule;
- linked training drill.

### Categories

- Draft;
- Lane;
- Wave;
- Jungle;
- Tracking;
- Vision;
- Rotation;
- Recall;
- Objective;
- Side lane;
- Teamfight;
- Positioning;
- Target selection;
- Communication;
- Tempo;
- Mechanics.

### Coach rule format

Every review should produce one or two executable rules, for example:

- `RESET_BEFORE_OBJECTIVE_IF_ITEM_SPIKE`;
- `DO_NOT_ENTER_RIVER_WITHOUT_MID_PRIORITY`;
- `WARD_COLLAPSE_ROUTE_BEFORE_CROSSING_RIVER`;
- `ADC_HIT_CLOSEST_SAFE_TARGET`;
- `JUNGLE_PLAN_NEXT_THREE_MOVES`.

The Performance Center should track whether the player repeats the error across later VODs.

---

## 13. FROMBOS coaching curriculum for the AI

The AI knowledge graph should represent these skills explicitly.

### Fundamentals

- champion identity;
- ability/cooldown knowledge;
- trading;
- spacing;
- farming;
- wave states;
- recall timing.

### Information

- minimap scanning;
- jungle tracking;
- missing-player tracking;
- cooldown tracking;
- vision state.

### Macro

- tempo;
- priority;
- rotations;
- objective setup;
- cross-map trades;
- side-lane pressure;
- reset windows;
- win-condition identification.

### Draft

- champion pool;
- blind safety;
- counter surface;
- synergy;
- composition debts;
- flex value;
- reveal cost;
- side advantage;
- Fearless future value.

### Teamfight

- engage;
- follow-up;
- peel;
- target access;
- damage windows;
- positioning;
- flank control;
- turn/exit discipline.

### Coaching

- identify repeated pattern;
- distinguish root cause from visible error;
- generate one practice rule;
- create drill;
- compare next VOD against the rule.

---

## 14. New product features derived from coaching study

### Coach Mode

When enabled, every major FROMBOS module explains **why** a recommendation exists.

### Draft Tutor

During mock draft:

- ask the user for the intended win condition;
- identify composition debts;
- warn when a counterpick harms team structure;
- show blind-pick risk;
- calculate Fearless pool cost;
- allow A/B/C branch comparison.

### Vision Trainer

On the exact Wild Rift map:

- choose side;
- choose game state;
- choose objective;
- place wards/sweeper path;
- reveal recommended purpose zones after submission;
- explain why each ward exists.

Do not turn this into a fixed “one correct ward” quiz; state changes the answer.

### Objective Setup Trainer

Interactive T-60 → T-0 sequence:

- waves;
- recall;
- jungle route;
- vision;
- positions;
- start/bait/turn/trade call.

### VOD Coach

After annotation, ask:

1. What did you know?
2. What did you think would happen?
3. What was the intended reward?
4. Which earlier decision made the position good/bad?
5. What one rule should be practiced?

### Skill Graph

Track team/player coaching dimensions over time:

- wave;
- vision;
- tempo;
- objective setup;
- rotations;
- positioning;
- drafting;
- champion pool;
- communication.

Scores should come from explicit review rubrics, not invented AI confidence.

---

## 15. Source-quality warning

Some contemporary third-party Wild Rift pages contain League-PC contamination. Example patterns include telling Wild Rift players to “buy a control ward for 75 gold,” which is not the Wild Rift trinket model.

Therefore:

- use Riot official material for mechanics whenever possible;
- validate third-party guides against current Wild Rift state;
- keep source type and patch metadata;
- never train the FROMBOS AI on scraped prose without platform validation.

This rule is mandatory for warding, items, runes, map mechanics and objective timers.

---

## 16. Public coach/video material studied

Representative public material includes:

- A-PLAY macro guide (waves, objectives, towers, split): https://www.youtube.com/watch?v=5b1RaL9ooYY
- KDU support guide (warding based on lane state, roaming and objective positioning): https://www.youtube.com/watch?v=4DGRHU9-s_A
- HellsDevil competitive VOD analysis, Horizon Cup SBTC vs TSM: https://www.youtube.com/watch?v=pEPRZB5Kycc
- Wild Rift Coaching / Danny public macro, objective, vision, role and VOD-review curriculum: https://wildriftcoaching.com/blog.html
- Riot Brazil historical esports interviews with coaches, analysts and players listed above.

These sources are teaching references, not automatically canonical game-data sources.

---

## Final principle

The FROMBOS AI should coach with this chain:

**What is known? → What is the wave state? → Who has tempo? → Who owns vision? → Who can arrive? → What are we playing for? → What is the safest executable plan? → How do we convert?**

If it cannot answer one link from evidence, it should expose the uncertainty rather than fabricate it.
