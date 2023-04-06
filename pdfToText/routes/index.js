import express from "express";
const router = express.Router();

import { getSummary } from "../service/getsummary.js";
import { processDocx, processImage, processPdf } from "../service/processfile.js";
import { saveEmail } from "../service/Email.js";


router.post('/processfile', async(req, res) => {
  const  {file}  = req.body;
  const fileType = file.split('.').pop();
  switch (fileType) {
    case 'pdf': 
      var text=await processPdf(file)
      res.status(200).send({ success: true ,text});
      break;
    case "doc":
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
  console.log(text, "TEXT")
  try {
    const summaryResponse = await getSummary(text);
    const summary = await summaryResponse.data.choices[0].text;
    const emailSaved = await saveEmail(req, res);
    if (emailSaved) {
      console.log(summary)
      res.json({ summary });
    } else {
      res.status(500).json({ error: 'Failed to save email to database.' });
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Unauthorized access', summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto nisi reprehenderit itaque provident vero et in dolor id suscipit aliquam? Molestias repellat eveniet unde nulla dolorem harum odio placeat illo!' });
  }
});
export default router

router.get('/download-summary', async (req, res) => {
  const { summary } = req.query;
  try {
    if (!summary) {
      throw new Error('No summary provided');
    }
    const filename = 'summary.txt';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});