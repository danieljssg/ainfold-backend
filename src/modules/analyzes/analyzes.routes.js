import { Router } from 'express';
import { uploadPdf } from '../../api/middlewares/multer.js';
import {
  generateTTS,
  getAnalysisById,
  getMyAnalyses,
  submitAnalysis,
  getAudioTTS,
} from './analyzes.controller.js';

const router = Router();

router.post('/', uploadPdf.single('cv'), submitAnalysis);
router.get('/:analysisId/tts', getAudioTTS);
router.post('/:analysisId/tts', generateTTS);

router.get('/', getMyAnalyses);
router.get('/:analysisId', getAnalysisById);

export default router;
