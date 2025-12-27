const COOLDOWN_TIME = 60 * 1000; // 60s
const KEY_COOLDOWN = new Map();

const MODELS = [
  {
    id: "general",
    modelName: "llama-3.1-8b-instant",
    system: "You are Ventora AI. Be clear, concise, and helpful.",
    keys: [
      process.env.GROQ_API_KEY_MAIN,
      process.env.GROQ_API_KEY_BACKUP
    ]
  },
  {
    id: "research",
    modelName: "llama-3.1-70b-versatile",
    system:
      "You are Ventora AI Research Mode. Provide detailed, structured, evidence-based answers.",
    keys: [
      process.env.GROQ_API_KEY_RESEARCH,
      process.env.GROQ_API_KEY_BACKUP
    ]
  },
  {
    id: "study",
    modelName: "llama-3.1-8b-instant",
    system:
      "You are Ventora AI Study Partner. Explain simply with examples.",
    keys: [
      process.env.GROQ_API_KEY_STUDY,
      process.env.GROQ_API_KEY_BACKUP
    ]
  }
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

  const requested = model?.replace("groq:", "") || "general";
  const now = Date.now();

  // 🔁 ORDER: start from requested, then others
  const orderedModels = [
    ...MODELS.filter(m => m.id === requested),
    ...MODELS.filter(m => m.id !== requested)
  ];

  let lastError = null;

  for (const m of orderedModels) {
    for (const key of m.keys) {
      if (!key) continue;

      const cooldownUntil = KEY_COOLDOWN.get(key);
      if (cooldownUntil && cooldownUntil > now) continue;

      try {
        const r = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: m.modelName,
              temperature: 0.7,
              max_tokens: 1024,
              messages: [
                { role: "system", content: m.system },
                ...messages
              ]
            })
          }
        );

        if (r.ok) {
          const data = await r.json();
          return res.status(200).json(data);
        }

        if (r.status === 429) {
          KEY_COOLDOWN.set(key, now + COOLDOWN_TIME);
          lastError = "Rate limited";
          continue;
        }

        lastError = await r.text();
      } catch (err) {
        lastError = err.message;
      }
    }
  }

  // 🚫 Absolute last fallback
  return res.status(429).json({
    error: "Ventora servers are busy. Please wait 60 seconds.",
    details: lastError
  });
}
