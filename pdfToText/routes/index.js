import express from "express";
const router = express.Router();

import { getSummary } from "../service/getsummary.js";
import {  processDocx, processImage, processPdf } from "../service/processfile.js";


router.post('/processfile', async(req, res) => {
  const  {file}  = req.body;
  const fileType = file.split('.').pop();
  switch (fileType) {
    case 'pdf': 
      var text=await processPdf(file)
      res.status(200).send({ success: true ,text});
      break;
    case 'doc':
    case 'docx':
      var text=await processDocx(file)
      res.status(200).send({ success: true,text});
      break;
    case 'jpeg':
    case 'jpg':
    case 'png':
      var text= await processImage(file)
      res.status(200).send({ success: true,text });
      break;
    default:
      console.log('file type not supported')
      res.json({ success: false });
      break;
  }
});


router.post('/summary', async (req, res) => {
  const { text } = req.body;
  console.log(text,"TEXT")
  try {
    const summaryResponse = await getSummary(text);
    const summary = summaryResponse.data.choices[0].text;
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
export default router;