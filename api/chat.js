export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get your Groq API key from environment variable
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { messages, model, temperature, max_tokens } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    try {
        console.log('Sending request to Groq API...');
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || 'llama-3.1-8b-instant',
                messages: messages,
                temperature: temperature || 0.7,
                max_tokens: max_tokens || 1024
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', response.status, errorText);
            
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error?.message || errorMessage;
            } catch (e) {
                // If response is not JSON, use text
            }
            
            return res.status(response.status).json({ error: errorMessage });
        }

        const data = await response.json();
        
        // Log success (optional)
        console.log('Groq API request successful');
        
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
}
