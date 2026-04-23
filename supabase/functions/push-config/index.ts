// Devolve a chave pública VAPID para o cliente subscrever.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
  return new Response(JSON.stringify({ publicKey }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
