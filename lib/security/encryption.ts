import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const TAG_LENGTH = 16
const ENCRYPTION_KEY_HEX_LENGTH = 64
const ENCRYPTION_KEY_BYTES = 32

function isProdEnv(): boolean {
  return process.env.NODE_ENV === "production"
}

function getEncryptionKey(): Buffer | null {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.trim().length === 0) {
    if (isProdEnv()) {
      throw new Error("[security] ENCRYPTION_KEY is required in production.")
    }

    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.warn("[security] ENCRYPTION_KEY not set. Tokens will not be encrypted.")
    }
    return null
  }

  const normalizedKey = key.trim()
  const isHex = /^[0-9a-fA-F]+$/.test(normalizedKey)
  if (!isHex || normalizedKey.length !== ENCRYPTION_KEY_HEX_LENGTH) {
    if (isProdEnv()) {
      throw new Error("[security] ENCRYPTION_KEY must be a 32-byte hex string (64 chars) in production.")
    }

    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.warn("[security] ENCRYPTION_KEY is invalid. Tokens will not be encrypted.")
    }
    return null
  }

  const parsed = Buffer.from(normalizedKey, "hex")
  if (parsed.length !== ENCRYPTION_KEY_BYTES) {
    if (isProdEnv()) {
      throw new Error("[security] ENCRYPTION_KEY must decode to exactly 32 bytes in production.")
    }

    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.warn("[security] ENCRYPTION_KEY length is invalid. Tokens will not be encrypted.")
    }
    return null
  }

  return parsed
}

/**
 * Encrypt a plaintext token using AES-256-GCM.
 * Returns base64-encoded string: IV (16 bytes) + ciphertext + auth tag (16 bytes)
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  if (!key) return plaintext

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8")
  encrypted = Buffer.concat([encrypted, cipher.final()])

  const tag = cipher.getAuthTag()

  // IV + ciphertext + tag
  const result = Buffer.concat([iv, encrypted, tag])
  return result.toString("base64")
}

/**
 * Decrypt a token encrypted by encryptToken().
 */
export function decryptToken(encrypted: string): string {
  const key = getEncryptionKey()
  if (!key) return encrypted

  try {
    const data = Buffer.from(encrypted, "base64")

    const iv = data.subarray(0, IV_LENGTH)
    const tag = data.subarray(data.length - TAG_LENGTH)
    const ciphertext = data.subarray(IV_LENGTH, data.length - TAG_LENGTH)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(ciphertext)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString("utf8")
  } catch {
    // If decryption fails, the token might be unencrypted (migration period)
    console.warn("[security] Token decryption failed. Returning as-is.")
    return encrypted
  }
}
