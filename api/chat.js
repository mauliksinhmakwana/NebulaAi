export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages, model, temperature = 0.7, max_tokens = 1024 } = req.body;

    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ error: "Invalid messages" });

    // --- ROUTING ---
    let endpoint = "";
    let apiKey = "";
    let finalModel = model;

    if (model.startsWith("groq:")) {
      endpoint = "https://api.groq.com/openai/v1/chat/completions";
      apiKey = process.env.GROQ_API_KEY;
      finalModel = model.replace("groq:", "");
    } 
    else if (model.startsWith("aiml:")) {
      endpoint = "https://api.aimlapi.com/v1/chat/completions";
      apiKey = process.env.AIML_API_KEY;
      finalModel = model.replace("aiml:", "");
    } 
    else {
      return res.status(400).json({ error: "Unknown model provider" });
    }

    if (!apiKey)
      return res.status(500).json({ error: "API key missing on server" });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: finalModel,
        messages,
        temperature,
        max_tokens
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "API error",
        details: data
      });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
}
