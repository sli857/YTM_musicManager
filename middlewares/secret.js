import { SECRET } from "../config/config.js";
import CryptoJS from "crypto-js";

function decrypt(str) {
  const bytes = CryptoJS.AES.decrypt(str, SECRET);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

function encrypt(str) {
  return CryptoJS.AES.encrypt(JSON.stringify(str), SECRET).toString();
}

export { decrypt, encrypt };
