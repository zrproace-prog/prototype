// Vercel serverless function — proxies requests to the Anthropic API.
// Set ANTHROPIC_API_KEY in the Vercel project's Environment Variables.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({
      error: "Server chưa cấu hình ANTHROPIC_API_KEY. Thêm biến môi trường này trong Vercel rồi redeploy.",
    });
    return;
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const prompt = body.prompt;
    if (!prompt) {
      res.status(400).json({ error: "Thiếu prompt" });
      return;
    }
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: (e && e.message) || "Proxy error" });
  }
}
