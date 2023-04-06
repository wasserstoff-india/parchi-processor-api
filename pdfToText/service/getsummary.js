import axios from "axios"
import { SUMMARY_URL } from "../config/config.js";

export const getSummary = async (text,) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      "model": "text-davinci-003",
      "prompt": "Summarise the following text : " + text + "\n\n",
      "max_tokens": 1024,
      "temperature": 0
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      }
    });
    return response;
  } catch (err) {
    console.log('error IN GPT ' + err);
  }
};

