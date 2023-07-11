import Email from '../modal/Email.js';

export const saveEmail = async (waId, name) => {
  console.log(waId, name, '::::::email');
  try {
    let findemail = await Email.findOne({ waId: waId, name: name });
    if (!findemail) {
      findemail = await Email.create({
        waId: waId,
        name: name,
      });
    }
    return findemail;
  } catch (err) {
    console.error(err);
    return null;
  }
};
