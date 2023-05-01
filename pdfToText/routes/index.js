import express from "express";
const router = express.Router();
import { DownloadSummay, ProcessFile, Summary } from "../Controller/Controller.js";


router.post('/processfile', ProcessFile)
router.post('/summary',Summary);
router.get('/download-summary',DownloadSummay);
export default router