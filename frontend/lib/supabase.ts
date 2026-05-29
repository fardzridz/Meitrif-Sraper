"use client";

import { createClient, type Session } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let anonymousSessionPromise: Promise<Session> | null = null;
let client: ReturnType<typeof createClient> | null = null;

function getSupabaseBrowser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured");
  }

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

export async function getAnonymousSession(captchaToken?: string) {
  const supabase = getSupabaseBrowser();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (sessionData.session) return sessionData.session;

  if (!captchaToken) {
    throw new Error("Turnstile verification is required before starting an anonymous session");
  }

  if (!anonymousSessionPromise) {
    anonymousSessionPromise = supabase.auth
      .signInAnonymously({
        options: {
          captchaToken
        }
      })
      .then(({ data, error }) => {
        if (error) throw new Error(error.message);
        if (!data.session) throw new Error("Anonymous session was not created");
        return data.session;
      })
      .finally(() => {
        anonymousSessionPromise = null;
      });
  }

  return anonymousSessionPromise;
}

export async function refreshAnonymousSession() {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw new Error(error.message);
  if (data.session) return data.session;
  return getAnonymousSession();
}

export async function getAccessToken() {
  const session = await getAnonymousSession();
  return session.access_token;
}
