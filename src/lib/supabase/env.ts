function readEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getSupabaseServiceRoleEnv() {
  return {
    serviceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

