import logger from '../../config/logger.js';

const TTS_URL = `${process.env.TTS_PROVIDER}/v1/audio/speech`;

/**
 * Genera audio a partir de texto usando Kokoro-TTS.
 * @param {string} text - El texto a convertir en audio (ai_insight).
 * @returns {Promise<Buffer>} - El audio generado como Buffer.
 */
export const generateSpeech = async (text) => {
  logger.info(`[tts.service] Generando audio (${text.length} caracteres)`);

  const response = await fetch(TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'kokoro',
      input: text,
      voice: 'ef_dora',
      speed: 1.15,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.log(response);

    throw new Error(`Kokoro-TTS ${response.status}: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};
