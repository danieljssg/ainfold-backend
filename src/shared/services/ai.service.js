export const analyzeResume = async (text) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en RH. Devuelve un JSON con: name, skills[], y ai_insight (máx 280 caracteres entusiasta).',
        },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    }),
  });
  return response.json();
};
