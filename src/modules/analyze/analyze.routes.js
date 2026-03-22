import { Router } from 'express';
import { validateSign } from '../auth/auth.middleware.js';
import { getJobStatus, getMyJobs, submitAnalysis, uploadPdf } from './analyze.controller.js';

const router = Router();

router.post('/', validateSign, uploadPdf.single('cv'), submitAnalysis);
router.get('/my-jobs', validateSign, getMyJobs);
router.get('/job/:jobId', validateSign, getJobStatus);

export default router;
