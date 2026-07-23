/**
 * auth.js — Admin Panel Authentication
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles sign-in, sign-out, and session management using Supabase Auth.
 * The Supabase client is loaded via CDN (window.supabase).
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Initialise the Supabase client (from CDN UMD bundle on window)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Attempt to sign in with email + password via Supabase Auth.
 * Returns { session, error }
 */
export async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email.trim(),
    password
  });
  return { session: data?.session || null, error };
}

/**
 * Sign the current user out and clear the session.
 */
export async function signOut() {
  await supabaseClient.auth.signOut();
}

/**
 * Returns the current active session (or null if not logged in).
 * Used on page load to restore a previous session.
 */
export async function getSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

/**
 * Returns the JWT access token for the current session.
 * This is passed as the Bearer token on API requests to the backend.
 */
export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || null;
}
