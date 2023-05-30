import { saveEmail } from '../service/Email.js';
import { getSummary } from '../service/response.js';

export const Summary = async (req, res) => {
  const { text, resdata } = req.body;
  console.log(req.body, '::::body');

  try {
    const summaryResponse = await getSummary(text);
    const summary = summaryResponse.data.choices[0].text;

    const emailSaved = await saveEmail(
      req.body.resdata.waId,
      req.body.resdata.waProfile.name
    );

    if (emailSaved) {
      res.json({ summary, userData: resdata });
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

export const DownloadSummay = async (req, res) => {
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
