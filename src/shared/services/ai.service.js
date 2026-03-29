import logger from '../../config/logger.js';
import { buildPrompt } from '../../utils/aiPromptBuilder.js';
import { ModelsPool } from '../../utils/modelsPool.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const analyzeResume = async (cvText, hobby = '', candidateName = '') => {
  const prompt = buildPrompt(cvText, hobby, candidateName);

  const keyToUse = ModelsPool.getNextKey() || process.env.OPENROUTER_KEY;

  logger.info('[ai.service] Generando analisis');

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${keyToUse}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      temperature: 1.0,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Eres un sistema de extracción de datos. Tu salida debe ser exclusivamente un JSON válido. No incluyas explicaciones ni markdown.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${err}`);
  }

  const data = await response.json();
  const actualModel = data.model || 'desconocido';
  logger.info(`[ai.service] Modelo utilizado: ${actualModel}`);

  const raw = data.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error('OpenRouter devolvió respuesta vacía');
  }

  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    const errorMsg = `JSON inválido recibido de OpenRouter (${actualModel})`;
    logger.error(`[ai.service] ${errorMsg}. Raw: ${raw.slice(0, 200)}`);
    throw new Error(errorMsg);
  }
};
