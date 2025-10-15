import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function run() {
  const email = process.argv[2] || "admin@royalswebtech.com";
  const password = process.argv[3] || "StrongPass@123";
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  console.log({ data, error });

  const { data: insert, error: insertErr } = await supabase.from("admin_emails").insert([{ email }]);
  console.log({ insert, insertErr });
}

run();
