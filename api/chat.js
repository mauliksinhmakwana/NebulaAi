// Vercel serverless function - this runs on the server, key stays hidden!
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { model, messages, temperature, max_tokens } = req.body;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    // Stream the response back (fast like original)
    res.setHeader('Content-Type', 'application/json');
    response.body.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error: ' + error.message });
  }
}

// Config for streaming support
export const config = {
  api: {
    bodyParser: false, // Important for streaming
  },
};
