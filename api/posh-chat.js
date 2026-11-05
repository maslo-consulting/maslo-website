/* Maslo POSH Consultant: AI answers via Google Gemini (free tier). Key stays server-side.
   Env vars (Vercel): GEMINI_API_KEY (required), GEMINI_MODEL (optional, default gemini-2.5-flash-lite) */
var hits = {};
function limited(ip) {
  var now = Date.now(), a = (hits[ip] || []).filter(function (t) { return now - t < 600000; });
  a.push(now); hits[ip] = a;
  if (Object.keys(hits).length > 5000) hits = {};
  return a.length > 15;
}
var SYSTEM = [
  "You are the Maslo POSH Consultant, an AI assistant on masloconsulting.com for Maslo Consulting Pvt Ltd (Hyderabad, India).",
  "You answer ONLY questions about the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH Act) and its Rules, as they apply in India: applicability, Internal Committee (IC) composition and tenure, Local Committee, complaints, inquiry, timelines, interim relief, penalties, employer duties, annual reports, training and awareness.",
  "Accuracy rules: Use the REFERENCE FACTS provided as the primary source and never contradict them. Only state what you are confident is correct under the POSH Act 2013. Do not invent section numbers, case names, penalties, dates or figures. If you are not sure, say so plainly and suggest speaking to a Maslo POSH specialist.",
  "Do not give legal advice or opinions on a specific case. Do not ask for or repeat names or personal details. If someone describes a live incident, tell them to contact their Internal Committee or the Local Committee and offer Maslo's specialists.",
  "If a question is not about POSH or workplace sexual harassment law, politely decline in one sentence and invite a POSH question.",
  "Style: warm, direct, plain English, 40 to 120 words, short paragraphs, no markdown headings, no bullet-heavy replies. End with one short pointer to Maslo only when helpful (POSH training, IC setup, external member, annual report)."
].join("\n");

module.exports = async function (req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.statusCode = 405; return res.end(JSON.stringify({ error: "method" })); }
  var key = process.env.GEMINI_API_KEY;
  if (!key) { res.statusCode = 503; return res.end(JSON.stringify({ error: "not_configured" })); }
  var ip = String((req.headers["x-forwarded-for"] || "").split(",")[0] || "x").trim();
  if (limited(ip)) { res.statusCode = 429; return res.end(JSON.stringify({ error: "rate" })); }
  var body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  var q = String(body.q || "").slice(0, 300).trim();
  if (!q) { res.statusCode = 400; return res.end(JSON.stringify({ error: "empty" })); }
  var ctx = (Array.isArray(body.ctx) ? body.ctx : []).slice(0, 3).map(function (c) { return String(c).slice(0, 700); });
  var hist = (Array.isArray(body.hist) ? body.hist : []).slice(-4).map(function (h) {
    return { role: h.r === "bot" ? "model" : "user", parts: [{ text: String(h.t || "").slice(0, 600) }] };
  });
  var contents = hist.concat([{ role: "user", parts: [{ text: "REFERENCE FACTS (vetted by Maslo):\n" + (ctx.length ? ctx.join("\n---\n") : "(none matched)") + "\n\nQUESTION: " + q }] }]);
  var model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  try {
    var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 12000);
    var r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 400 }
      })
    });
    clearTimeout(to);
    if (!r.ok) { res.statusCode = 502; return res.end(JSON.stringify({ error: "upstream", status: r.status })); }
    var d = await r.json();
    var t = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
    t = t ? t.map(function (p) { return p.text || ""; }).join("").trim() : "";
    if (!t) { res.statusCode = 502; return res.end(JSON.stringify({ error: "empty_answer" })); }
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ a: t.slice(0, 1200) }));
  } catch (e) {
    res.statusCode = 504; return res.end(JSON.stringify({ error: "timeout" }));
  }
};
