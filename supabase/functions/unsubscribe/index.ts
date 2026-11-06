// Unsubscribe link in reminder emails: GET ?s=<screening id>. Turns off "send me tips" for
// that screening and sends the visitor to the site with a confirmation.
// Also answers the one-click POST that mail apps send (List-Unsubscribe-Post).
// Deploy with verify_jwt = false. Secret: SITE_URL.
import { createClient } from "npm:@supabase/supabase-js@2";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const UUID = /^[0-9a-f-]{36}$/i;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("s") ?? "";
  const lang = ["es", "ar"].includes(url.searchParams.get("lang") ?? "") ? `${url.searchParams.get("lang")}/` : "";
  if (UUID.test(id)) {
    const { data } = await admin.from("screenings").select("email").eq("id", id).maybeSingle();
    // All screenings with the same address: one click stops every reminder to it.
    if (data?.email) await admin.from("screenings").update({ marketing_consent: false }).eq("email", data.email);
  }
  if (req.method === "POST") return new Response("ok");
  const site = (Deno.env.get("SITE_URL") ?? "https://farket.uclergnlts.com/").replace(/\/?$/, "/");
  return Response.redirect(`${site}${lang}?unsubscribed=1`, 302);
});
