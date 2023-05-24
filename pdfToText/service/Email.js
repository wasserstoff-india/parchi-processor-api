import Email from '../modal/Email.js';

export const saveEmail = async (email) => {
  try {
    console.log(email, '###########');
    await Email.create({
      email: email,
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
