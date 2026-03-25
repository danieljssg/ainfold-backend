import logger from '../../config/logger.js';
import Job from '../../shared/models/Job.js';

export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne(
      { _id: jobId, userId: req.user.id },
      '_id status progress attempts analysisId completedAt error',
    ).lean();
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job no encontrado' });
    }
    const base = {
      success: true,
      jobId: job._id,
      status: job.status,
      progress: job.progress,
      attempts: job.attempts,
    };
    if (job.status === 'completed') {
      return res
        .status(200)
        .json({ ...base, analysisId: job.analysisId, completedAt: job.completedAt });
    }
    if (job.status === 'failed') {
      return res
        .status(200)
        .json({ ...base, success: false, error: job.error ?? 'El análisis falló.' });
    }
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
