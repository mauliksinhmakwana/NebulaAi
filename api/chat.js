export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { model, messages, temperature, max_tokens } = req.body;

  if (!model || !messages) {
    return res.status(400).json({ error: "Model or messages missing" });
  }

  try {
    // ================= GROQ =================
    if (model.startsWith("groq:")) {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model.replace("groq:", ""),
          messages,
          temperature,
          max_tokens
        })
      });

      return res.status(resp.status).json(await resp.json());
    }

    // ================= GEMINI =================
    if (model.startsWith("google:")) {
      const geminiModel = model.replace("google:", "");
      const prompt = messages.map(m => m.content).join("\n");

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await resp.json();

      return res.status(200).json({
        choices: [
          {
            message: {
              role: "assistant",
              content: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
            }
          }
        ]
      });
    }

    // ================= OPENAI =================
    if (model.startsWith("openai:")) {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model.replace("openai:", ""),
          messages,
          temperature,
          max_tokens
        })
      });

      return res.status(resp.status).json(await resp.json());
    }

    return res.status(400).json({ error: "Unknown model provider" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
