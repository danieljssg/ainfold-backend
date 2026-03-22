import { Worker } from 'bullmq';
import logger from '../../config/logger.js';
import { WorkerConnection } from '../../config/redis.js';
import User from '../../shared/models/User.js';
import { processPdfText } from '../../shared/services/pdfService.js';
import { analyzeResume } from '../../shared/services/aiService.js';

export const analysisWorker = new Worker(
  'analysisStream',
  async (job) => {
    const { pdfBuffer, socketId } = job.data;

    try {
      // 1 & 2. Extracción
      let { shouldOCR, content } = await processPdfText(pdfBuffer);

      if (shouldOCR) {
        // 3. Callback OCR (Opcional para la demo)
        // content = await runTesseract(pdfBuffer);
        throw new Error('El PDF requiere OCR, no soportado en esta demo rápida.');
      }

      // 4 & 5. Análisis LLM e Insight
      const aiResult = await analyzeResume(content);
      const resultData = JSON.parse(aiResult.choices[0].message.content);

      // 6. Guardar y Notificar
      // await db.collection('cvs').insertOne({ ...resultData, createdAt: new Date() });

      // Emitir via socketId guardado en el job
      io.to(socketId).emit('CV_READY', resultData);

      return resultData;
    } catch (error) {
      io.to(socketId).emit('CV_ERROR', { message: error.message });
      throw error;
    }
  },
  {
    connection: WorkerConnection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
);
