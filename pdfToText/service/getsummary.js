import axios from "axios"

export const getSummary = async (text) => {
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
    return response.send(200).json({status:true})
  } catch (err) {
    console.log('error ' + err);
  }
};

