// FROMBOS CORE — organization-aware cloud persistence
// Cloud is canonical for authenticated organization/team data. Local Core remains an offline/cache layer.
import { supabase } from './auth.js';
import { coreStore } from './store-adapter.js';

const ACTIVE_ORG_KEY = 'frombos.active.organization';
const ACTIVE_TEAM_KEY = 'frombos.active.team';
const ACTIVE_SEASON_KEY = 'frombos.active.team-season';

const getActiveOrgId = () => localStorage.getItem(ACTIVE_ORG_KEY) || null;
const getActiveTeamId = () => localStorage.getItem(ACTIVE_TEAM_KEY) || null;
const getActiveSeasonId = () => localStorage.getItem(ACTIVE_SEASON_KEY) || null;

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sessão autenticada necessária.');
  return data.user;
}

function rememberSelection({ teamId = null, seasonId = null } = {}) {
  if (teamId) localStorage.setItem(ACTIVE_TEAM_KEY, teamId);
  else localStorage.removeItem(ACTIVE_TEAM_KEY);
  if (seasonId) localStorage.setItem(ACTIVE_SEASON_KEY, seasonId);
  else localStorage.removeItem(ACTIVE_SEASON_KEY);
}

export async function listTeams(organizationId = getActiveOrgId()) {
  if (!organizationId) return [];
  await requireUser();
  const { data, error } = await supabase.from('teams').select('id, organization_id, name, slug, game, created_at').eq('organization_id', organizationId).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTeam(name, slug, game = 'wild_rift', organizationId = getActiveOrgId()) {
  if (!organizationId) throw new Error('Nenhuma organização ativa.');
  await requireUser();
  const { data, error } = await supabase.from('teams').insert({ organization_id: organizationId, name: name.trim(), slug: slug.trim().toLowerCase(), game }).select('id, organization_id, name, slug, game, created_at').single();
  if (error) throw error;
  rememberSelection({ teamId: data.id });
  return data;
}

export async function updateTeam(teamId, patch) {
  await requireUser();
  const allowed = {};
  if (patch.name != null) allowed.name = patch.name.trim();
  if (patch.slug != null) allowed.slug = patch.slug.trim().toLowerCase();
  if (patch.game != null) allowed.game = patch.game;
  const { data, error } = await supabase.from('teams').update(allowed).eq('id', teamId).select('id, organization_id, name, slug, game, created_at').single();
  if (error) throw error;
  return data;
}

export async function listSeasons(teamId = getActiveTeamId()) {
  if (!teamId) return [];
  await requireUser();
  const { data, error } = await supabase.from('team_seasons').select('id, team_id, label, starts_on, ends_on, active, created_at').eq('team_id', teamId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createSeason(teamId, label, startsOn = null, endsOn = null, active = true) {
  await requireUser();
  const { data, error } = await supabase.from('team_seasons').insert({ team_id: teamId, label: label.trim(), starts_on: startsOn || null, ends_on: endsOn || null, active }).select('id, team_id, label, starts_on, ends_on, active, created_at').single();
  if (error) throw error;
  rememberSelection({ teamId, seasonId: data.id });
  return data;
}

export async function updateSeason(seasonId, patch) {
  await requireUser();
  const allowed = {};
  if (patch.label != null) allowed.label = patch.label.trim();
  if (patch.starts_on !== undefined) allowed.starts_on = patch.starts_on || null;
  if (patch.ends_on !== undefined) allowed.ends_on = patch.ends_on || null;
  if (patch.active !== undefined) allowed.active = !!patch.active;
  const { data, error } = await supabase.from('team_seasons').update(allowed).eq('id', seasonId).select('id, team_id, label, starts_on, ends_on, active, created_at').single();
  if (error) throw error;
  return data;
}

export async function listPlayers(seasonId = getActiveSeasonId()) {
  if (!seasonId) return [];
  await requireUser();
  const { data, error } = await supabase.from('players').select('id, team_season_id, display_name, primary_role, secondary_roles, active, created_at').eq('team_season_id', seasonId).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function upsertPlayer({ id, teamSeasonId = getActiveSeasonId(), displayName, primaryRole, secondaryRoles = [], active = true }) {
  if (!teamSeasonId) throw new Error('Nenhuma temporada ativa.');
  await requireUser();
  const payload = { team_season_id: teamSeasonId, display_name: displayName.trim(), primary_role: primaryRole, secondary_roles: secondaryRoles, active };
  if (id) payload.id = id;
  const { data, error } = await supabase.from('players').upsert(payload).select('id, team_season_id, display_name, primary_role, secondary_roles, active, created_at').single();
  if (error) throw error;
  return data;
}

export async function listChampionPools(playerIds = []) {
  if (!playerIds.length) return [];
  await requireUser();
  const { data, error } = await supabase.from('player_champion_pool').select('player_id, champion_id, role, tier, coach_note, last_validated_at, updated_by, updated_at').in('player_id', playerIds);
  if (error) throw error;
  return data || [];
}

function roleMap(players) {
  const map = {};
  for (const player of players) map[player.primary_role] = player;
  return map;
}

export async function loadActiveWorkspace({ organizationId = getActiveOrgId() } = {}) {
  await requireUser();
  const orgId = organizationId || getActiveOrgId();
  if (!orgId) throw new Error('Nenhuma organização ativa.');

  const teams = await listTeams(orgId);
  const selectedTeam = teams.find(t => t.id === getActiveTeamId()) || teams[0] || null;
  if (!selectedTeam) return { organizationId: orgId, teams, team: null, seasons: [], season: null, players: [], pools: [] };

  rememberSelection({ teamId: selectedTeam.id });
  const seasons = await listSeasons(selectedTeam.id);
  const selectedSeason = seasons.find(s => s.id === getActiveSeasonId()) || seasons.find(s => s.active) || seasons[0] || null;
  if (!selectedSeason) return { organizationId: orgId, teams, team: selectedTeam, seasons, season: null, players: [], pools: [] };

  rememberSelection({ teamId: selectedTeam.id, seasonId: selectedSeason.id });
  const players = await listPlayers(selectedSeason.id);
  const pools = await listChampionPools(players.map(p => p.id));
  return { organizationId: orgId, teams, team: selectedTeam, seasons, season: selectedSeason, players, pools };
}

export function hydrateCoreFromCloud(snapshot) {
  if (!snapshot?.team) return snapshot;
  const byRole = roleMap(snapshot.players || []);
  const poolsByPlayer = {};
  for (const pool of snapshot.pools || []) (poolsByPlayer[pool.player_id] ||= []).push(pool.champion_id);
  coreStore.update(core => {
    core.team.id = snapshot.team.id;
    core.team.name = snapshot.team.name;
    core.team.format = core.team.format || 'MD5';
    for (const role of Object.keys(core.team.players)) {
      const player = byRole[role];
      if (!player) continue;
      core.team.players[role].id = player.id;
      core.team.players[role].name = player.display_name;
      core.team.players[role].pool = poolsByPlayer[player.id] || [];
    }
    core.meta.cloud = { organizationId: snapshot.organizationId, teamId: snapshot.team.id, teamSeasonId: snapshot.season?.id || null, hydratedAt: new Date().toISOString() };
    return core;
  });
  return snapshot;
}

export async function bootstrapCloudWorkspace(options = {}) {
  const snapshot = await loadActiveWorkspace(options);
  hydrateCoreFromCloud(snapshot);
  return snapshot;
}

export async function persistCoreTeam({ createMissing = true } = {}) {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Nenhuma organização ativa.');
  await requireUser();

  let teamId = getActiveTeamId() || coreStore.state.team.id;
  let team = teamId && !String(teamId).startsWith('team_local') ? (await listTeams(orgId)).find(t => t.id === teamId) : null;
  if (!team && createMissing) {
    const name = coreStore.state.team.name.trim();
    if (!name) throw new Error('Defina o nome do time antes de salvar.');
    const slug = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || `team-${Date.now()}`;
    team = await createTeam(name, slug, 'wild_rift', orgId);
    teamId = team.id;
  }
  if (!team) throw new Error('Time ativo não encontrado.');
  if (team.name !== coreStore.state.team.name.trim()) team = await updateTeam(teamId, { name: coreStore.state.team.name, slug: team.slug });

  let seasons = await listSeasons(teamId);
  let season = seasons.find(s => s.id === getActiveSeasonId()) || seasons.find(s => s.active) || seasons[0] || null;
  if (!season && createMissing) season = await createSeason(teamId, `${new Date().getFullYear()}`);
  if (!season) return { team, season: null, players: [] };

  const players = [];
  const playerIds = [];
  for (const [role, player] of Object.entries(coreStore.state.team.players)) {
    if (!player.name?.trim()) continue;
    const saved = await upsertPlayer({ id: player.id && !String(player.id).startsWith('player_') ? player.id : undefined, teamSeasonId: season.id, displayName: player.name, primaryRole: role, secondaryRoles: [], active: true });
    players.push(saved);
    playerIds.push(saved.id);
  }

  const existingPools = await listChampionPools(playerIds);
  if (existingPools.length) {
    const { error } = await supabase.from('player_champion_pool').delete().in('player_id', playerIds);
    if (error) throw error;
  }
  const poolRows = [];
  const savedByRole = Object.fromEntries(players.map(player => [player.primary_role, player]));
  for (const [role, player] of Object.entries(coreStore.state.team.players)) {
    const saved = savedByRole[role];
    if (!saved) continue;
    for (const championId of player.pool || []) poolRows.push({ player_id: saved.id, champion_id: championId, role, tier: 'developing' });
  }
  if (poolRows.length) {
    const { error } = await supabase.from('player_champion_pool').insert(poolRows);
    if (error) throw error;
  }

  rememberSelection({ teamId, seasonId: season.id });
  coreStore.update(core => {
    core.team.id = team.id;
    for (const saved of players) {
      const role = saved.primary_role;
      if (core.team.players[role]) core.team.players[role].id = saved.id;
    }
    core.meta.cloud = { organizationId: orgId, teamId, teamSeasonId: season.id, hydratedAt: core.meta.cloud?.hydratedAt || null, syncedAt: new Date().toISOString() };
    return core;
  });
  return { team, season, players };
}

export const cloudStore = {
  listTeams,
  createTeam,
  updateTeam,
  listSeasons,
  createSeason,
  updateSeason,
  listPlayers,
  upsertPlayer,
  listChampionPools,
  loadActiveWorkspace,
  bootstrapCloudWorkspace,
  hydrateCoreFromCloud,
  persistCoreTeam,
  get activeOrganizationId() { return getActiveOrgId(); },
  get activeTeamId() { return getActiveTeamId(); },
  get activeSeasonId() { return getActiveSeasonId(); }
};
