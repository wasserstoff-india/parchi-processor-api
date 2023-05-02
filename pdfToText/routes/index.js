import express from "express";
const router = express.Router();
import {  ProcessFile } from "../Controller/ProcessController.js";
import { DownloadSummay, Summary, getSummary } from "../service/getsummary.js";


router.post('/processfile', ProcessFile)
router.post('/summary',Summary);
router.get('/download-summary',DownloadSummay);
export default router