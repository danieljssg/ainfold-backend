import logger from '../../config/logger.js';
import { addJobAnalysis } from '../../jobs/queues/main.queue.js';
import Analysis from '../../shared/models/Analysis.js';
import Job from '../../shared/models/Job.js';
import { analyzeSchema } from '../../utils/validations/schemas/analyzeSchema.js';

export const submitAnalysis = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Se requiere un archivo PDF' });
    }
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }
    const { candidateName, hobby } = parsed.data;
    const job = await Job.create({
      userId: req.user.id,
      createdBy: req.user.id,
      candidateName,
      hobby,
      status: 'pending',
      progress: { percentage: 0, step: 'En cola' },
    });
    await addJobAnalysis('ANALYZE_CV', {
      jobId: job._id.toString(),
      pdfBuffer: req.file.buffer.toString('base64'),
      candidateName,
      hobby,
    });
    return res
      .status(201)
      .json({
        success: true,
        jobId: job._id,
        status: 'pending',
        progress: job.progress,
        message: 'Tu CV está siendo analizado',
      });
  } catch (error) {
    logger.error('[analyze.controller] submitAnalysis error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne(
      { _id: jobId, userId: req.user.id },
      '_id status progress attempts analysisId completedAt error',
    ).lean();
    if (!job) return res.status(404).json({ success: false, error: 'Job no encontrado' });
    const base = {
      success: true,
      jobId: job._id,
      status: job.status,
      progress: job.progress,
      attempts: job.attempts,
    };
    if (job.status === 'completed')
      return res
        .status(200)
        .json({ ...base, analysisId: job.analysisId, completedAt: job.completedAt });
    if (job.status === 'failed')
      return res
        .status(200)
        .json({ ...base, success: false, error: job.error ?? 'El análisis falló.' });
    return res.status(200).json(base);
  } catch (error) {
    logger.error('[analyze.controller] getJobStatus error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id })
      .select('_id status candidateName hobby progress analysisId createdAt completedAt error')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return res.status(200).json({ success: true, data: jobs, count: jobs.length });
  } catch (error) {
    logger.error('[analyze.controller] getMyJobs error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      createdBy: req.user.id,
    }).lean();
    if (!analysis) return res.status(404).json({ success: false, error: 'Análisis no encontrado' });
    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    logger.error('[analyze.controller] getAnalysisById error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getMyAnalyses = async (req, res) => {
  try {
    const full = req.query.full === 'true';
    const query = Analysis.find({ createdBy: req.user.id }).sort({ createdAt: -1 }).limit(20);
    if (!full) query.select('_id candidateData functionalArea occupation createdAt');
    const analyses = await query.lean();
    return res.status(200).json({ success: true, data: analyses, count: analyses.length, full });
  } catch (error) {
    logger.error('[analyze.controller] getMyAnalyses error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const purgeUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const [jobsResult, analysesResult] = await Promise.all([
      Job.deleteMany({ userId }),
      Analysis.deleteMany({ createdBy: userId }),
    ]);
    logger.info(
      `[analyze.controller] Purge usuario ${userId}: ${jobsResult.deletedCount} jobs, ${analysesResult.deletedCount} análisis`,
    );
    return res
      .status(200)
      .json({
        success: true,
        deleted: { jobs: jobsResult.deletedCount, analyses: analysesResult.deletedCount },
      });
  } catch (error) {
    logger.error('[analyze.controller] purgeUserData error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};
