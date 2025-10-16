
const CryptoJS = require('crypto-js');

// Clave de encriptación desde variables de entorno
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'tu-clave-secreta-de-encriptacion-cambiar-en-produccion';

/**
 * Encripta un texto usando AES
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado
 */
const encrypt = (text) => {
  if (!text) return null;
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Error al encriptar:', error);
    throw new Error('Error en la encriptación');
  }
};

/**
 * Desencripta un texto encriptado con AES
 * @param {string} encryptedText - Texto encriptado
 * @returns {string} - Texto desencriptado
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Error al desencriptar:', error);
    throw new Error('Error en la desencriptación');
  }
};

module.exports = {
  encrypt,
  decrypt
};
