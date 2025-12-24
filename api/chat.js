// api/chat.js - SIMPLE WORKING VERSION
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log request
    console.log('Request received');
    
    // Get API key
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    // Check if API key exists
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing in environment variables');
      return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }
    
    // Parse request body
    const body = req.body;
    console.log('Request body:', JSON.stringify(body));
    
    const { messages, model, temperature, max_tokens } = body;
    
    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Messages must be an array',
        example: '{"messages":[{"role":"user","content":"Hello"}]}' 
      });
    }
    
    // Prepare request to Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Nebula-AI-Backend/1.0'
      },
      body: JSON.stringify({
        model: model || 'llama-3.1-8b-instant',
        messages: messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1024,
        stream: false
      })
    });
    
    // Check Groq response
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errorText);
      return res.status(groqResponse.status).json({ 
        error: `Groq API error: ${groqResponse.status}`,
        details: errorText.substring(0, 200) // First 200 chars
      });
    }
    
    // Parse and return response
    const data = await groqResponse.json();
    console.log('Groq response success, choices:', data.choices?.length || 0);
    
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Server error:', error.message);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      hint: 'Check Vercel logs for details'
    });
  }
}
