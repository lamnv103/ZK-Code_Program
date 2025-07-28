import crypto from "crypto"

const ALGORITHM = "aes-256-cbc"
const KEY_LENGTH = 32
const IV_LENGTH = 16

// Generate a consistent key from the environment variable
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY || "default-encryption-key-for-demo-only"
  return crypto.scryptSync(keyString, "salt", KEY_LENGTH) // derive key
}

export function encryptBalance(balance: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    const encrypted = Buffer.concat([
      cipher.update(balance, "utf8"),
      cipher.final()
    ])

    // Combine iv + encrypted data
    return iv.toString("hex") + ":" + encrypted.toString("hex")
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt balance")
  }
}

export function decryptBalance(encryptedData: string): string {
  try {
    const key = getEncryptionKey()
    const [ivHex, encryptedHex] = encryptedData.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const encrypted = Buffer.from(encryptedHex, "hex")

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])

    return decrypted.toString("utf8")
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt balance")
  }
}

// Hash-based commitment (balance + nonce)
export function generateCommitment(balance: string): string {
  const nonce = crypto.randomBytes(16).toString("hex")
  return crypto.createHash("sha256").update(balance + nonce).digest("hex")
}

// Simple AES encryption with fallback key – NOT recommended for production
export function simpleEncrypt(text: string): string {
  try {
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "demo-key", "salt", 24)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-192-cbc", key, iv)
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
    return iv.toString("hex") + ":" + encrypted.toString("hex")
  } catch (error) {
    console.error("Simple encryption error:", error)
    return text
  }
}

export function simpleDecrypt(encryptedText: string): string {
  try {
    const [ivHex, encryptedHex] = encryptedText.split(":")
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || "demo-key", "salt", 24)
    const iv = Buffer.from(ivHex, "hex")
    const encrypted = Buffer.from(encryptedHex, "hex")
    const decipher = crypto.createDecipheriv("aes-192-cbc", key, iv)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString("utf8")
  } catch (error) {
    console.error("Simple decryption error:", error)
    return "1000" // fallback
  }
}
