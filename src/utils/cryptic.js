const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
let encryptedString

const cryptic = {
  encrypt: (data) => {
    const id = crypto.randomBytes(5).toString('hex');
    const de_key = crypto.randomBytes(2).toString('hex');
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    encryptedString = Buffer.concat([cipher.update(data), cipher.final()]).toString('hex');

    //console.log(encryptedString.toString('hex'));
    return {
      encryptedString,
      decrypt: de_key,
      key: key.toString('hex'),
      iv: iv.toString('hex'),
      id
    }
  },
  decrypt: (data, key, iv) => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decryptedString = Buffer.concat([decipher.update(data), decipher.final()]);
    return decryptedString.toString()
    //console.log(decryptedString.toString());
  }
}

module.exports = cryptic