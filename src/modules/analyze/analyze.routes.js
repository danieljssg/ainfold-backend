import { Router } from 'express';
import { validateSign } from '../auth/auth.middleware.js';
import {
  uploadPdf,
  submitAnalysis,
  getJobStatus,
  getMyJobs,
  getAnalysisById,
  getMyAnalyses,
} from './analyze.controller.js';

const router = Router();

router.post('/', validateSign, uploadPdf.single('cv'), submitAnalysis);
router.get('/my-jobs', validateSign, getMyJobs);
router.get('/job/:jobId', validateSign, getJobStatus);
router.get('/analyses', validateSign, getMyAnalyses);
router.get('/analyses/:analysisId', validateSign, getAnalysisById);

export default router;
