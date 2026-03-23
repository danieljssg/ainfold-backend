import multer from 'multer';
import logger from '../../config/logger.js';
import { addJobAnalysis } from '../../jobs/queues/main.queue.js';
import Analysis from '../../shared/models/Analysis.js';
import Job from '../../shared/models/Job.js';
import { analyzeSchema } from '../../utils/validations/schemas/analyzeSchema.js';

const storage = multer.memoryStorage();
const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

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
    });

    await addJobAnalysis('ANALYZE_CV', {
      jobId: job._id.toString(),
      pdfBuffer: req.file.buffer.toString('base64'),
      candidateName,
      hobby,
    });

    return res.status(201).json({
      success: true,
      jobId: job._id,
      status: 'pending',
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
    const job = await Job.findOne({ _id: jobId, userId: req.user.id }).lean();

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job no encontrado' });
    }

    if (job.status === 'pending' || job.status === 'processing') {
      return res.status(200).json({
        success: true,
        jobId: job._id,
        status: job.status,
        attempts: job.attempts,
      });
    }

    if (job.status === 'completed' && job.analysisId) {
      const analysis = await Analysis.findById(job.analysisId).lean();
      return res.status(200).json({
        success: true,
        jobId: job._id,
        status: 'completed',
        candidateName: job.candidateName,
        completedAt: job.completedAt,
        analysis,
      });
    }

    return res.status(200).json({
      success: false,
      jobId: job._id,
      status: job.status,
      error: job.error ?? 'El análisis falló sin mensaje de error.',
    });
  } catch (error) {
    logger.error('[analyze.controller] getJobStatus error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id })
      .select('_id status candidateName hobby analysisId createdAt completedAt error')
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
    const { analysisId } = req.params;
    const analysis = await Analysis.findOne({
      _id: analysisId,
      createdBy: req.user.id,
    }).lean();

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Análisis no encontrado' });
    }

    return res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    logger.error('[analyze.controller] getAnalysisById error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

export const getMyAnalyses = async (req, res) => {
  try {
    const full = req.query.full === 'true';

    const selectFields = full ? null : '_id candidateData functionalArea occupation createdAt';

    const query = Analysis.find({ createdBy: req.user.id }).sort({ createdAt: -1 }).limit(20);

    if (selectFields) {
      query.select(selectFields);
    }

    const analyses = await query.lean();

    return res.status(200).json({
      success: true,
      data: analyses,
      count: analyses.length,
      full,
    });
  } catch (error) {
    logger.error('[analyze.controller] getMyAnalyses error:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};
