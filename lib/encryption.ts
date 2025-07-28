<<<<<<< HEAD
import crypto from "crypto"

const ALGORITHM = "aes-256-cbc"
const KEY_LENGTH = 32
const IV_LENGTH = 16

// Generate a consistent key from the environment variable
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY || "default-encryption-key-for-demo-only"
  return crypto.scryptSync(keyString, "salt", KEY_LENGTH)
=======
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

// Generate a consistent key from the environment variable
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY || "default-encryption-key-for-demo-only";
  return crypto.scryptSync(keyString, "salt", KEY_LENGTH);
>>>>>>> 063705e (Initial commit)
}

export function encryptBalance(balance: string): string {
  try {
<<<<<<< HEAD
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ALGORITHM, key)

    let encrypted = cipher.update(balance, "utf8", "hex")
    encrypted += cipher.final("hex")

    // Combine iv + encrypted data
    return iv.toString("hex") + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt balance")
=======
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(balance, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Combine iv + encrypted data
    return iv.toString("hex") + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt balance");
>>>>>>> 063705e (Initial commit)
  }
}

export function decryptBalance(encryptedData: string): string {
  try {
<<<<<<< HEAD
    const key = getEncryptionKey()

    // Extract iv and encrypted data
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), "hex")
    const encrypted = encryptedData.slice(IV_LENGTH * 2)

    const decipher = crypto.createDecipher(ALGORITHM, key)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt balance")
=======
    const key = getEncryptionKey();

    // Extract iv and encrypted data
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), "hex");
    const encrypted = encryptedData.slice(IV_LENGTH * 2);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt balance");
>>>>>>> 063705e (Initial commit)
  }
}

export function generateCommitment(balance: string): string {
<<<<<<< HEAD
  const nonce = crypto.randomBytes(16).toString("hex")
  return crypto
    .createHash("sha256")
    .update(balance + nonce)
    .digest("hex")
=======
  const nonce = crypto.randomBytes(16).toString("hex");
  return crypto
    .createHash("sha256")
    .update(balance + nonce)
    .digest("hex");
>>>>>>> 063705e (Initial commit)
}

// Simple encryption/decryption functions for demo purposes
export function simpleEncrypt(text: string): string {
  try {
<<<<<<< HEAD
    const key = process.env.ENCRYPTION_KEY || "demo-key"
    const cipher = crypto.createCipher("aes192", key)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return encrypted
  } catch (error) {
    console.error("Simple encryption error:", error)
    return text // Return original text if encryption fails
=======
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "demo-key", "salt", 24);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-192-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + encrypted;
  } catch (error) {
    console.error("Simple encryption error:", error);
    return text;
>>>>>>> 063705e (Initial commit)
  }
}

export function simpleDecrypt(encryptedText: string): string {
  try {
<<<<<<< HEAD
    const key = process.env.ENCRYPTION_KEY || "demo-key"
    const decipher = crypto.createDecipher("aes192", key)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Simple decryption error:", error)
    return "1000" // Return default balance if decryption fails
=======
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "demo-key", "salt", 24);
    const iv = Buffer.from(encryptedText.slice(0, 32), "hex");
    const encrypted = encryptedText.slice(32);
    const decipher = crypto.createDecipheriv("aes-192-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Simple decryption error:", error);
    return "1000";
>>>>>>> 063705e (Initial commit)
  }
}
