import { Worker } from 'bullmq';
import logger from '../../config/logger.js';
import { WorkerConnection } from '../../config/redis.js';
import { setJobProgress } from '../../modules/jobs/job.service.js';
import Analysis from '../../shared/models/Analysis.js';
import Job from '../../shared/models/Job.js';
import { analyzeResume } from '../../shared/services/ai.service.js';
import { processPdfText } from '../../shared/services/pdf.service.js';

export const ttsWorker = new Worker(
  'audioStream',
  async (job) => {
    const { jobId, ai_insight } = job.data;

    try {
      const jobDoc = await Job.findByIdAndUpdate(
        jobId,
        { status: 'processing', startedAt: new Date(), $inc: { attempts: 1 } },
        { returnDocument: 'after' },
      );

      if (!jobDoc) {
        throw new Error(`Job ${jobId} no encontrado en MongoDB`);
      }

      const nodeBuffer = Buffer.from(pdfBuffer, 'base64');
      const buffer = new Uint8Array(
        nodeBuffer.buffer,
        nodeBuffer.byteOffset,
        nodeBuffer.byteLength,
      );

      await setJobProgress(jobId, 10, 'Preparando documento...');

      const { shouldOCR, content } = await processPdfText(buffer);

      await setJobProgress(jobId, 60, 'Sintetizando información...');

      if (shouldOCR) {
        await Job.findByIdAndUpdate(jobId, {
          status: 'failed',
          error:
            'El PDF es un documento escaneado y no contiene texto extraíble. Por favor sube un CV en formato digital.',
          completedAt: new Date(),
        });
        return { success: false, reason: 'ocr_required' };
      }

      const result = await analyzeResume(content, hobby, candidateName);

      const analysis = await Analysis.create({
        userId: jobDoc.userId,
        createdBy: jobDoc.userId,
        hobby,
        candidateData: {
          ...result.candidateData,
          fullName: candidateName || result.candidateData?.fullName || 'N/A',
        },
        radarStats: result.radarStats,
        functionalArea: result.functionalArea,
        occupation: result.occupation,
        ai_insight: result.ai_insight,
        summary: result.summary,
      });

      await Job.findByIdAndUpdate(jobId, {
        status: 'completed',
        analysisId: analysis._id,
        completedAt: new Date(),
        progress: { percentage: 100, step: 'Finalizado' },
      });

      logger.info(`[analysisWorker] Job ${jobId} completado — ${analysis.candidateData.fullName}`);

      return { success: true, jobId, analysisId: analysis._id };
    } catch (err) {
      logger.error(`[analysisWorker] Error inesperado en job ${jobId}: ${err.message}`);
      await Job.findByIdAndUpdate(jobId, {
        status: 'failed',
        error: err.message,
        completedAt: new Date(),
      }).catch(() => {});
      throw err;
    }
  },
  {
    connection: WorkerConnection,
    concurrency: 1,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
);

ttsWorker.on('completed', (job) => {
  logger.info(`[ttsWorker] Job ${job.id} completado`);
});

ttsWorker.on('failed', (job, err) => {
  logger.error(`[ttsWorker] Job ${job?.id} falló: ${err.message}`);
});
