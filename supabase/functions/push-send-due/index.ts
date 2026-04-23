// Lê alertas pendentes (fire_at <= now) e dispara Web Push para todos os devices inscritos.
// Pode ser invocado por cron externo a cada 1 min OU manualmente (botão "Testar agora").
import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import webpush from "https://esm.sh/web-push@3.6.7";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") || "";
  const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "";
  const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "";

  if (!VAPID_PUBLIC || !VAPID_PRIVATE || !VAPID_EMAIL) {
    return new Response(
      JSON.stringify({ error: "VAPID keys not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Allow manual ad-hoc push for testing
  let testPayload: { title?: string; body?: string } | null = null;
  if (req.method === "POST") {
    try {
      const j = await req.json();
      if (j?.test) testPayload = { title: j.title || "🔔 Teste real", body: j.body || "Push em background OK." };
    } catch {}
  }

  // Get devices
  const { data: subs, error: subsErr } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");
  if (subsErr) {
    return new Response(JSON.stringify({ error: subsErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!subs || subs.length === 0) {
    return new Response(JSON.stringify({ ok: true, devices: 0, sent: 0, message: "No subscriptions" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sendOne = async (sub: any, payload: object) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        } as any,
        JSON.stringify(payload)
      );
      return { ok: true };
    } catch (e: any) {
      const status = e?.statusCode;
      // Clean up dead subscriptions
      if (status === 404 || status === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
      console.error("push fail", status, e?.body || e?.message);
      return { ok: false, status };
    }
  };

  let totalSent = 0;

  // === TEST MODE ===
  if (testPayload) {
    for (const s of subs) {
      const res = await sendOne(s, {
        title: testPayload.title,
        body: testPayload.body,
        url: "/config",
      });
      if (res.ok) totalSent++;
    }
    return new Response(
      JSON.stringify({ ok: true, mode: "test", devices: subs.length, sent: totalSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // === DUE ALERTS MODE ===
  const nowIso = new Date().toISOString();
  const { data: alerts, error: alertsErr } = await supabase
    .from("push_alerts_agendados")
    .select("*")
    .eq("enviado", false)
    .lte("fire_at", nowIso)
    .order("fire_at", { ascending: true })
    .limit(50);

  if (alertsErr) {
    return new Response(JSON.stringify({ error: alertsErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!alerts || alerts.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, devices: subs.length, alerts: 0, sent: 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  for (const alert of alerts) {
    const payload = {
      title: `🔔 ${alert.label}`,
      body: alert.detail || "Lembrete agendado",
      tag: `alert-${alert.id}`,
      url: "/config",
    };
    for (const s of subs) {
      const res = await sendOne(s, payload);
      if (res.ok) totalSent++;
    }
    await supabase
      .from("push_alerts_agendados")
      .update({ enviado: true, enviado_at: new Date().toISOString() })
      .eq("id", alert.id);
  }

  return new Response(
    JSON.stringify({ ok: true, devices: subs.length, alerts: alerts.length, sent: totalSent }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
