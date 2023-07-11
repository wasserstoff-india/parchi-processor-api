import { saveEmail } from '../service/Email.js';
import { CreateCsv, getSummary } from '../service/response.js';

export const Summary = async (req, res) => {
  const { text, resdata } = req.body;
  console.log(req.body, '::::body');

  try {
    // const summaryResponse = await getSummary(text);
    // const summary = summaryResponse.data.choices[0].text;
    const csv = await CreateCsv(text);
    console.log(csv, '::::createcsv');
    // const response = csv.data.choices[0].message.content;
    // console.log(response, '::::::response');
    const summaryStartIndex = csv.content.indexOf('SUMMARY:') + 8;
    const summaryEndIndex = csv.content.length - 1;
    const summary = csv.content.substring(summaryStartIndex, summaryEndIndex);
    console.log(summary, ':::summary');
    const emailSaved = await saveEmail(
      req.body.resdata.waId,
      req.body.resdata.waProfile.name
    );

    if (emailSaved) {
      res.json({ summary, userData: resdata, content: csv?.content });
    } else {
      res.status(500).json({ error: 'Failed to save email to database.' });
    }
  } catch (err) {
    console.error(err.stack, 'err');
    console.error(err.message, 'err');
    res.status(500).json({
      error: err.message,
      summary: err.message,
    });
  }
};

export const DownloadSummary = async (req, res) => {
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
};
