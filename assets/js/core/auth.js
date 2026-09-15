import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0';

export const SUPABASE_URL = 'https://tzebnllpqkntuxnhxfjz.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_UONl0aiZ9uau4ox1W2MN1w_3mfcJtaD';
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function listOrganizations() {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(id, name, slug)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(row => ({ ...row.organizations, role: row.role }));
}

export async function createOrganization(name, slug) {
  const { data, error } = await supabase.rpc('create_organization_with_owner', {
    org_name: name.trim(),
    org_slug: slug.trim().toLowerCase()
  });
  if (error) throw error;
  return data;
}

export function slugify(value) {
  return value.toString().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
}
