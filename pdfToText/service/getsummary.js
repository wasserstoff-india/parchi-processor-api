import axios from "axios"
import { AUTHRIZATION, SUMMARY_URL } from "../config/config.js";
import { saveEmail } from "../service/Email.js";


export const getSummary = async (text) => {
  try {
    console.log(text,"::::::summarytext")
    // console.log(SUMMARY_URL,":::::: summary url")
    // console.log(AUTHRIZATION, "::::: authorization")
    const response = await axios.post(SUMMARY_URL, {
      "model": "text-davinci-003",
      "prompt": "Summarise the following text : " + text + "\n\n",
      "max_tokens": 1024,
      "temperature": 0
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": AUTHRIZATION
      }
    });
    return response;
  } catch (err) {
    console.log("Error in getSummaruy")
    // console.log('error IN GPT ' + err);
  }
};

export const Summary=async(req,res)=>{
  console.log(req.body, ":::::body")
  const  text  = req.body.text;
  console.log(text, "TEXT")
  try {
    const summaryResponse = await getSummary(text);
    console.log(summaryResponse,":::::summaryResponse")
    const summary = await summaryResponse.data.choices[0].text;
    const emailSaved = await saveEmail(req, res);
    if (emailSaved) {
      console.log(summary)
      res.json({ summary });
    } else {
      res.status(500).json({ error: 'Failed to save email to database.' });
    }
  } catch (err) {
    console.error("err");
    res.status(401).json({ error: 'Unauthorized access', summary: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto nisi reprehenderit itaque provident vero et in dolor id suscipit aliquam? Molestias repellat eveniet unde nulla dolorem harum odio placeat illo!' });
  }
}

export const DownloadSummay= async (req, res) => {
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
}

