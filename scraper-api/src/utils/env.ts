import "dotenv/config";

function optionalString(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : "";
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  SUPABASE_URL: optionalString("SUPABASE_URL"),
  SUPABASE_ANON_KEY: optionalString("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: optionalString("SUPABASE_SERVICE_ROLE_KEY"),
  ADMIN_SECRET_KEY: optionalString("ADMIN_SECRET_KEY"),
  NODE_ENV: process.env.NODE_ENV ?? "development"
};
