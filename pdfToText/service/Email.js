import Email from "../modal/Email.js";



export const saveEmail = async (req, res) => {
  try {
    const { email } = req.body; 
    console.log(email,"###########");
    await Email.create({
      email: email,
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}






