const COOLDOWN_TIME = 60 * 1000;
const KEY_COOLDOWN = new Map();

/* =========================
   GROQ (FALLBACK ONLY)
========================= */
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_KEYS = [
  process.env.GROQ_API_KEY_MAIN,
  process.env.GROQ_API_KEY_RESEARCH,
  process.env.GROQ_API_KEY_STUDY,
  process.env.GROQ_API_KEY_BACKUP
];

/* =========================
   OPENROUTER (PRIMARY)
========================= */
const OPENROUTER_MODELS = {
  general: {
    model: "openai/gpt-oss-120b:free",
    key: process.env.OPENROUTER_KEY_GENERAL
  },
  reasoning: {
    model: "deepseek/deepseek-r1-0528:free",
    key: process.env.OPENROUTER_KEY_REASON
  },
  research: {
    model: "allenai/olmo-3.1-32b-think:free",
    key: process.env.OPENROUTER_KEY_RESEARCH
  }
};

/* =========================
   SYSTEM PROMPTS (MIA)
========================= */
const VEA_MODES = {
  general: {
    system: "You are Ventora AI, a Medical Information Assistant. Be clear, factual, and concise. Educational only."
  },
  reasoning: {
    system:
      "You are Ventora AI in Clinical Reasoning mode. Explain step-by-step logic clearly. Do not speculate or prescribe."
  },
  research: {
    system:
      "You are Ventora AI in Research mode. Provide structured, evidence-based explanations. No diagnosis or treatment advice."
  }
};

/* =========================
   KEYWORD ESCALATION
========================= */
function detectMode(text, selectedMode) {
  const t = text.toLowerCase();

  const reasoningKeywords = [
    "why", "how", "reason", "logic", "cause", "mechanism",
    "difference", "compare", "explain"
  ];

  const researchKeywords = [
    "research", "analysis", "analyze", "study", "evidence",
    "clinical", "pharmacology", "pathway", "molecular",
    "review", "detailed", "deep"
  ];

  if (
    selectedMode !== "research" &&
    researchKeywords.some(k => t.includes(k))
  ) {
    return "research";
  }

  if (
    selectedMode === "general" &&
    reasoningKeywords.some(k => t.includes(k))
  ) {
    return "reasoning";
  }

  return selectedMode;
}

/* =========================
   API HANDLER
========================= */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { messages, model, temperature = 0.7, maxTokens = 1024 } = req.body;
  if (!Array.isArray(messages))
    return res.status(400).json({ error: "Invalid messages" });

  // model comes like: mia:general | mia:reasoning | mia:research | groq:general
  let selectedMode = "general";

  if (typeof model === "string" && model.startsWith("mia:")) {
    selectedMode = model.replace("mia:", "");
  }

  const userText = messages[messages.length - 1]?.content || "";
  const finalMode = detectMode(userText, selectedMode);

  const systemPrompt =
    VEA_MODES[finalMode]?.system || VEA_MODES.general.system;

  /* =========================
     1️⃣ OPENROUTER (PRIMARY)
  ========================= */
  const orConfig = OPENROUTER_MODELS[finalMode];

  if (orConfig?.key) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${orConfig.key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ventora-ai.vercel.app",
            "X-Title": "Ventora AI"
          },
          body: JSON.stringify({
            model: orConfig.model,
            temperature,
            max_tokens: maxTokens,
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
    } catch {
      // silent fail → fallback
    }
  }

  /* =========================
     2️⃣ GROQ (AUTO FALLBACK)
  ========================= */
  const now = Date.now();

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
            model: GROQ_MODEL,
            temperature,
            max_tokens: maxTokens,
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
      }
    } catch {}
  }

  return res.status(429).json({
    error:
      "Ventora MIA is temporarily busy. Please try again."
  });
}
