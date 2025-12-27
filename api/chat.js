const COOLDOWN_TIME = 60 * 1000; // 60 seconds
const KEY_COOLDOWN = new Map();

const MODEL_NAME = "llama-3.1-8b-instant";

// VEA MODES (PROMPT-ONLY DIFFERENCE)
const VEA_MODES = {
  general: {
    system: "You are Ventora AI. Be clear, concise, and helpful."
  },
  research: {
    system:
      "You are Ventora AI in Research Mode. Give structured, detailed, evidence-based answers with headings."
  },
  study: {
    system:
      "You are Ventora AI Study Partner. Explain simply, step by step, with examples."
  },
  backup: {
    system:
      "You are Ventora AI Backup Mode. Keep responses short and safe."
  }
};

// GROQ KEY POOL (ALL SAME MODEL)
const GROQ_KEYS = [
  process.env.GROQ_API_KEY_MAIN,
  process.env.GROQ_API_KEY_RESEARCH,
  process.env.GROQ_API_KEY_STUDY,
  process.env.GROQ_API_KEY_BACKUP
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { messages, model } = req.body;
  if (!Array.isArray(messages))
    return res.status(400).json({ error: "Invalid messages" });

  const veaMode = model?.replace("groq:", "") || "general";
  const systemPrompt =
    VEA_MODES[veaMode]?.system || VEA_MODES.general.system;

  const now = Date.now();
  let lastError = null;

  for (const key of GROQ_KEYS) {
    if (!key) continue;

    const cooldownUntil = KEY_COOLDOWN.get(key);
    if (cooldownUntil && cooldownUntil > now) continue;

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: MODEL_NAME,
            temperature: veaMode === "research" ? 0.6 : 0.7,
            max_tokens: 1024,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }

      if (response.status === 429) {
        KEY_COOLDOWN.set(key, now + COOLDOWN_TIME);
        lastError = "Rate limited";
        continue;
      }

      lastError = await response.text();
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(429).json({
    error:
      "Ventora servers are busy right now. Please wait 60 seconds and try again."
  });
}
