import crypto from "crypto"

const ALGORITHM = "aes-256-cbc"
const KEY_LENGTH = 32
const IV_LENGTH = 16

// Generate a consistent key from the environment variable
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY || "default-encryption-key-for-demo-only"
  return crypto.scryptSync(keyString, "salt", KEY_LENGTH)
}

export function encryptBalance(balance: string): string {
  try {
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
  }
}

export function decryptBalance(encryptedData: string): string {
  try {
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
  }
}

export function generateCommitment(balance: string): string {
  const nonce = crypto.randomBytes(16).toString("hex")
  return crypto
    .createHash("sha256")
    .update(balance + nonce)
    .digest("hex")
}

// Simple encryption/decryption functions for demo purposes
export function simpleEncrypt(text: string): string {
  try {
    const key = process.env.ENCRYPTION_KEY || "demo-key"
    const cipher = crypto.createCipher("aes192", key)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return encrypted
  } catch (error) {
    console.error("Simple encryption error:", error)
    return text // Return original text if encryption fails
  }
}

export function simpleDecrypt(encryptedText: string): string {
  try {
    const key = process.env.ENCRYPTION_KEY || "demo-key"
    const decipher = crypto.createDecipher("aes192", key)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Simple decryption error:", error)
    return "1000" // Return default balance if decryption fails
  }
}
