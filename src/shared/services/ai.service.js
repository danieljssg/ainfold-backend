import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import logger from '../../config/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RAW_PROMPT = readFileSync(join(__dirname, '../prompts/analysisPrompt.txt'), 'utf-8');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const INSIGHT_TONE =
  'Habla con energía y visión de futuro. Proyecta al candidato como un talento en ascenso donde su hobby es el <power-up> que lo hace  imparabley diferente. Sé ingenioso: explica cómo su pasión personal le da una ventaja única y divertida que otros no tienen. No analices solo el hoy, inspira sobre el impacto que tendrá mañana su perfil híbrido en la industria.';

const FALLBACK_RESULT = {
  candidateData: {
    fullName: 'N/A',
    profession: 'N/A',
    age: 'N/A',
    email: 'N/A',
    phone: 'N/A',
    dni: 'N/A',
  },
  functionalArea: { area: 'N/A', score: 0 },
  occupation: 'N/A',
  ai_insight: 'No fue posible generar el análisis. Por favor intenta de nuevo.',
  summary: {
    profile: 'N/A',
    experience: 'N/A',
    education: 'N/A',
    skills: { technical: [], soft: [] },
    justify: 'N/A',
  },
};

const buildPrompt = (cvText, hobby, candidateName) => {
  const submittedData = `Nombre del candidato (dato verificado, usar este exactamente): ${candidateName}
Hobby o pasión del candidato: ${hobby || 'No especificado'}
ID único de análisis: #${Math.floor(Math.random() * 99999)}

Texto del CV:
${cvText}`;

  return RAW_PROMPT.replace('{{submittedData}}', submittedData).replace(
    '{{insightTone}}',
    INSIGHT_TONE,
  );
};

export const analyzeResume = async (cvText, hobby = '', candidateName = '') => {
  const prompt = buildPrompt(cvText, hobby, candidateName);

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:3000',
      'X-Title': "AI'nFold",
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      temperature: 1.0,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error('OpenRouter devolvió respuesta vacía');
  }

  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    logger.warn(`[ai.service] JSON inválido, usando fallback. Raw: ${raw.slice(0, 200)}`);
    return FALLBACK_RESULT;
  }
};
