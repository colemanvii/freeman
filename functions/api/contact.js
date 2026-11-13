// Cloudflare Pages Function — server-side Resend relay.
// RESEND_API_KEY is a Cloudflare Pages Production secret, never a client variable.
export async function onRequestPost({ request, env }) {
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Type": "application/json" };
  const reply = (code, payload) => new Response(JSON.stringify(payload), { status: code, headers });
  const origin = request.headers.get("Origin");
  const allowed = new Set(["https://freeman-d6f.pages.dev", "https://freemangc.com", "https://www.freemangc.com"]);
  if (origin && !allowed.has(origin)) return reply(403, { error: "Origin not allowed." });
  if (!env.RESEND_API_KEY) return reply(503, { error: "Messaging is not configured yet." });
  if (Number(request.headers.get("content-length") || 0) > 12000) return reply(413, { error: "Message too large." });
  let data;
  try { data = await request.json(); } catch (_) { return reply(400, { error: "Invalid request." }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return reply(400, { error: "Invalid request." });
  if (data.website) return reply(200, { ok: true }); // Honeypot
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  if (email.length > 254 || !/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(email)) return reply(400, { error: "Please enter a valid email address." });
  if (message.length < 3 || message.length > 4000) return reply(400, { error: "Please write a message between 3 and 4000 characters." });
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Freeman Website <contact@freemangc.com>",
        to: ["gabe@freemangc.com"],
        cc: ["cole@freemangc.com"],
        reply_to: email,
        subject: "New inquiry — Freeman General Contracting",
        text: "Reply to: " + email + "\n\n" + message
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      console.error("Resend response status:", response.status);
      return reply(502, { error: "Your message couldn't be delivered. Please try again." });
    }
    return reply(200, { ok: true });
  } catch (error) {
    console.error("Resend request failed:", error?.name || "unknown");
    return reply(502, { error: "Your message couldn't be delivered. Please try again." });
  }
}
