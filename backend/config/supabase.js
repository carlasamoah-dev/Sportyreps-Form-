const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn("Supabase URL and Anon Key are missing. Please provide them in .env");
}

const supabaseUrl = env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = env.SUPABASE_ANON_KEY || "placeholder";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
