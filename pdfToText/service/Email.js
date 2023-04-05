import Email from "../modal/Email.js";



export const saveEmail = async (req, res) => {
  try {
    const { email } = req.body; 
    console.log(email,"###########");
    const newEmail = await Email.create({
      email: email,
    });
    return res.status(200);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save email to database.' });
  }
}