import { Router } from 'express';
import { uploadPdf } from '../../api/middlewares/multer.js';
import { getAnalysisById, getMyAnalyses, submitAnalysis } from './analyzes.controller.js';

const router = Router();

router.post('/', uploadPdf.single('cv'), submitAnalysis);

router.get('/', getMyAnalyses);
router.get('/:analysisId', getAnalysisById);

export default router;
