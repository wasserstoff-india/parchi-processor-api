import axios from "axios"

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

