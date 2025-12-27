// In-memory cooldown store (safe on Vercel per instance)
const KEY_COOLDOWN = new Map();
const COOLDOWN_TIME = 60 * 1000; // 60 seconds

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { messages, model, temperature = 0.7, max_tokens = 1024 } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }

  const GROQ_POOLS = {
    general: [
      {
        name: "main",
        key: process.env.GROQ_API_KEY_MAIN,
        systemPrompt: "You are Ventora AI. Be clear, concise, and helpful."
      },
      {
        name: "backup",
        key: process.env.GROQ_API_KEY_BACKUP,
        systemPrompt: "You are Ventora AI. Answer clearly."
      }
    ],
    research: [
      {
        name: "research",
        key: process.env.GROQ_API_KEY_RESEARCH,
        systemPrompt:
          "You are Ventora AI Research Mode. Provide structured, evidence-based answers."
      },
      {
        name: "backup",
        key: process.env.GROQ_API_KEY_BACKUP,
        systemPrompt:
          "You are Ventora AI Research Mode. Be factual and structured."
      }
    ],
    study: [
      {
        name: "study",
        key: process.env.GROQ_API_KEY_STUDY,
        systemPrompt:
          "You are Ventora AI Study Partner. Explain simply with examples."
      },
      {
        name: "backup",
        key: process.env.GROQ_API_KEY_BACKUP,
        systemPrompt:
          "You are Ventora AI Study Partner. Keep answers easy."
      }
    ]
  };

  const mode = model?.replace("groq:", "") || "general";
  const pool = GROQ_POOLS[mode] || GROQ_POOLS.general;

  let lastError = null;
  const now = Date.now();

  for (const slot of pool) {
    if (!slot.key) continue;

    // ⏸️ Skip key if cooling down
    const cooldownUntil = KEY_COOLDOWN.get(slot.key);
    if (cooldownUntil && cooldownUntil > now) {
      continue;
    }

    try {
      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${slot.key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            temperature,
            max_tokens,
            messages: [
              { role: "system", content: slot.systemPrompt },
              ...messages
            ]
          })
        }
      );

      if (groqRes.ok) {
        const data = await groqRes.json();
        return res.status(200).json(data);
      }

      // 🚨 Rate limit → put key in cooldown
      if (groqRes.status === 429) {
        KEY_COOLDOWN.set(slot.key, now + COOLDOWN_TIME);
        lastError = "Rate limited on key: " + slot.name;
        continue;
      }

      lastError = await groqRes.text();
    } catch (err) {
      lastError = err.message;
    }
  }

  // 🚫 All keys exhausted
  return res.status(429).json({
    error: "Ventora is busy. Please try again shortly.",
    details: lastError
  });
}
