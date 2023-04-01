import express from "express";
const router = express.Router();

import { getSummary } from "../service/getsummary.js";
import { processDocx, processImage, processPdf } from "../service/processfile.js";



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
      var text=processDocx(file)
      res.status(200).send({ success: true,text});
      break;
    case 'jpeg':
    case 'jpg':
    case 'png':
     var text= processImage(file)
      res.status(200).send({ success: true,text });
      break;
    default:
      console.log('file type not supported')
      res.json({ success: false });
      break;
  }
});


router.post('/summary', (req, res) => {
  const { text } = req.body;
  console.log(text)

  getSummary(text, (err, summary) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Something went wrong' });
    }

    res.json({ summary });
  });
});
export default router;