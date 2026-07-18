import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const MODEL = 'deepseek-v4-flash';

app.post('/api/ai', async (req, res) => {
  const { action, data } = req.body;

  console.log(`📨 Incoming API request - Action: ${action}`);

  try {
    if (action === 'chat') {
      const { systemPrompt, conversationHistory, message } = data;
      console.log(`💬 Chat request - Message: "${message?.substring(0, 50)}..."`);

      const messages = [];

      // Add system prompt
      messages.push({
        role: 'system',
        content: systemPrompt
      });

      // Add conversation history (last 10 messages)
      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory.slice(-10)) {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message
      });

      console.log(`🚀 Calling DeepSeek (${MODEL})... (${messages.length} messages)`);

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: 0.3,
          max_tokens: 4096,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      let aiResponse = result.choices?.[0]?.message?.content || '';
      console.log(`✅ Response received (${aiResponse.length} chars)`);

      return res.status(200).json({ response: aiResponse });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Fitness Pacer AI server running on http://localhost:${PORT}`);
  console.log(`🤖 Model: ${MODEL}`);
  console.log(`🔑 DeepSeek Key: ✓ Configured`);
});