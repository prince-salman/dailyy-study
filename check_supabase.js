const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://dhknzpelvgvwobbdyurj.supabase.co",
  "sb_publishable_W5pHgnLsPMyA-kVtFdQ3qA_nBkZ4yUN"
);

async function checkConnection() {
  const { data, error } = await supabase.from("users").select("count").limit(1);
  if (error && error.code === "42P01") {
    console.log("NEED_MIGRATION: tables do not exist yet");
  } else if (error) {
    console.log("ERROR:", error.message);
  } else {
    console.log("OK: tables exist");
  }
}

checkConnection();
