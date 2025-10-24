import { supabase } from "./supabase/supabaseBrowserClient";

// Sign up with email/password
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: {
    data: { full_name: fullName }
  } });
  return { data, error };
}

// Sign in with email/password
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Sign in with OAuth 
export async function signInWithSocialProvider(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider });
  return { data, error };
}

// Logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  return {error};
}
