import express from 'express';
const router = express.Router();
import { ProcessFile } from '../Controller/ProcessController.js';
import {
  DownloadSummary,
  Summary,
} from '../Controller/getsummaryController.js';
import { Chats } from '../Controller/ChatsController.js';

router.post('/processfile', ProcessFile);
router.post('/summary', Summary);
router.get('/download-summary', DownloadSummary);
router.post('/chats', Chats);
export default router;
