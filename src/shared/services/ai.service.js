import { OpenRouter } from '@openrouter/sdk';

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_KEY,
});

export const analyzeResume = async (text, hobby = '', feel = 'dramatic') => {
  const completion = await client.chat.send({
    model: 'openrouter/free',
    response_format: { type: 'json_object' },
    plugins: [{ id: 'response-healing' }],
    provider: { require_parameters: true },
    max_tokens: 1000,
    messages: [
      { role: 'system', content: buildSystemPrompt(feel) },
      { role: 'user', content: buildUserPrompt(text, hobby) },
    ],
  });

  const raw = completion.choices[0].message.content;
  return JSON.parse(raw);
};
