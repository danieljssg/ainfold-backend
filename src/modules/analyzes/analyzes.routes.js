import { Router } from 'express';
import { uploadPdf } from '../../api/middlewares/multer.js';
import {
  generateTTS,
  getAnalysisById,
  getMyAnalyses,
  submitAnalysis,
} from './analyzes.controller.js';

const router = Router();

router.post('/', uploadPdf.single('cv'), submitAnalysis);
router.post('/:analysisId/tts', generateTTS);

router.get('/', getMyAnalyses);
router.get('/:analysisId', getAnalysisById);

export default router;
