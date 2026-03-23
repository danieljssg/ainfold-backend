import { Worker } from 'bullmq';
import logger from '../../config/logger.js';
import { WorkerConnection } from '../../config/redis.js';
import Analysis from '../../shared/models/Analysis.js';
import Job from '../../shared/models/Job.js';
import { analyzeResume } from '../../shared/services/ai.service.js';
import { processPdfText } from '../../shared/services/pdf.service.js';

export const analysisWorker = new Worker(
  'analysisStream',
  async (job) => {
    const { jobId, pdfBuffer, candidateName, hobby } = job.data;

    try {
      const jobDoc = await Job.findByIdAndUpdate(
        jobId,
        { status: 'processing', startedAt: new Date(), $inc: { attempts: 1 } },
        { new: true },
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

      const { shouldOCR, content } = await processPdfText(buffer);

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
        functionalArea: result.functionalArea,
        occupation: result.occupation,
        ai_insight: result.ai_insight,
        summary: result.summary,
      });

      await Job.findByIdAndUpdate(jobId, {
        status: 'completed',
        analysisId: analysis._id,
        completedAt: new Date(),
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
    concurrency: 3,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
);

analysisWorker.on('completed', (job) => {
  logger.info(`[analysisWorker] Job ${job.id} completado`);
});

analysisWorker.on('failed', (job, err) => {
  logger.error(`[analysisWorker] Job ${job?.id} falló: ${err.message}`);
});
