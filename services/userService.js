const crypto = require('crypto');

const decryptMessage = (encryptedMessage) => {
  const { iv, encryptedData } = encryptedMessage;
  if (!iv || !encryptedData) {
    throw new Error('Invalid encrypted message format');
  }
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(encryptedData, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), ivBuffer);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const encrypt = (text) => {
  const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(text));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

module.exports = {
  decryptMessage,
  encrypt
};