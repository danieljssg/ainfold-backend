import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OpenRouter } from '@openrouter/sdk';
import logger from '../../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_PROMPT = readFileSync(join(__dirname, '../prompts/analysisPrompt.md'), 'utf-8');

const client = new OpenRouter({ apiKey: process.env.OPENROUTER_KEY });

const FEEL_PROFILES = {
  dramatic: {
    temperature: 1.1,
    instruction:
      'Escribe con tensión narrativa y metáforas cinematográficas potentes. Cada habilidad es un arma, cada hobby un arco dramático que potencia el perfil.',
  },
  poetic: {
    temperature: 1.2,
    instruction:
      'Usa lenguaje evocador y metafórico. El análisis debe leerse como prosa literaria. Las habilidades son constelaciones, el hobby el hilo invisible que las conecta.',
  },
  sharp: {
    temperature: 0.8,
    instruction:
      'Sé conciso, incisivo y sin adornos. Cada frase debe ir al grano. El análisis es un veredicto ejecutivo, no una conversación.',
  },
  visionary: {
    temperature: 1.0,
    instruction:
      'Habla del potencial futuro del candidato, no solo del presente. El hobby revela capacidades latentes. Inspira y proyecta.',
  },
  technical: {
    temperature: 0.7,
    instruction:
      'Sé riguroso y analítico. Cuantifica cuando sea posible. El análisis debe sonar a consultoría de alto nivel.',
  },
};

const buildSystemPrompt = (feel) => {
  const feelConfig = FEEL_PROFILES[feel] ?? FEEL_PROFILES.dramatic;

  const prompt = BASE_PROMPT.replace(
    '`${submittedData}`',
    'el texto del CV del candidato y su hobby personal',
  );

  return `${prompt}

INSTRUCCIÓN DE ESTILO PARA ESTE ANÁLISIS:
${feelConfig.instruction}

REGLAS CRÍTICAS:
- Responde ÚNICAMENTE con el objeto JSON. Sin texto antes ni después.
- Sin bloques de código markdown (no uses \`\`\`json).
- Todos los campos son obligatorios. Usa 'N/A' si no encuentras el dato en el CV.
- El campo ai_insight DEBE conectar la profesión con el hobby suministrado.
- El campo score de functionalArea debe ser un número decimal entre 1.0 y 100.0.`;
};

const buildUserPrompt = (cvText, hobby) => {
  const seed = Math.floor(Math.random() * 99999);
  return `TEXTO DEL CV:\n---\n${cvText}\n---\n\nHOBBY/PASIÓN DEL CANDIDATO: ${hobby || 'No especificado'}\n\nID DE ANÁLISIS: #${seed} (cada análisis debe ser único e irrepetible)`;
};

const analyzeResume = async (cvText, hobby = '', feel = 'dramatic') => {
  const feelConfig = FEEL_PROFILES[feel] ?? FEEL_PROFILES.dramatic;

  const completion = await client.chat.send({
    model: 'openrouter/free',
    temperature: feelConfig.temperature,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
    plugins: [{ id: 'response-healing' }],
    provider: { require_parameters: true },
    messages: [
      { role: 'system', content: buildSystemPrompt(feel) },
      { role: 'user', content: buildUserPrompt(cvText, hobby) },
    ],
  });

  const raw = completion.choices[0].message.content;
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch (err) {
    logger.error('[ai.service] Error parsing AI response:', err.message);
    logger.error('[ai.service] Raw response:', clean);
    return {
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
      summary: 'N/A',
    };
  }
};

export { analyzeResume, FEEL_PROFILES };
