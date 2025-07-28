import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

<<<<<<< HEAD
=======
const algorithm = "aes-256-cbc"
const ivLength = 16

// Hàm tạo cipher và mã hóa
function encrypt(text: string, secret: string): string {
  const iv = crypto.randomBytes(ivLength)
  const key = crypto.scryptSync(secret, "zktransfer_salt", 32)
  const cipher = crypto.createCipheriv(algorithm, key, iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted // Trả về IV để giải mã sau
}

>>>>>>> 063705e (Initial commit)
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

<<<<<<< HEAD
    // Generate wallet address (simplified)
    const walletAddress = "0x" + crypto.randomBytes(20).toString("hex")

    // Generate and encrypt private key
    const privateKey = crypto.randomBytes(32).toString("hex")
    const encryptedKey = crypto.createCipher("aes-256-cbc", password).update(privateKey, "utf8", "hex")
=======
    // Generate wallet address
    const walletAddress = "0x" + crypto.randomBytes(20).toString("hex")

    // Generate private key and encrypt it
    const privateKey = crypto.randomBytes(32).toString("hex")
    const encryptedKey = encrypt(privateKey, password)

    // Encrypt initial balance (1000) with private key
    const encryptedBalance = encrypt("1000", privateKey)

    // Create commitment
    const commitment = crypto
      .createHash("sha256")
      .update("1000" + crypto.randomBytes(16).toString("hex"))
      .digest("hex")
>>>>>>> 063705e (Initial commit)

    // Create user with balance
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        walletAddress,
        encryptedKey,
        status: "active",
        balance: {
          create: {
<<<<<<< HEAD
            encryptedBalance: crypto.createCipher("aes-256-cbc", privateKey).update("1000", "utf8", "hex"), // Initial balance of 1000
            commitment: crypto
              .createHash("sha256")
              .update("1000" + crypto.randomBytes(16).toString("hex"))
              .digest("hex"),
=======
            encryptedBalance,
            commitment,
>>>>>>> 063705e (Initial commit)
          },
        },
      },
      include: {
        balance: true,
      },
    })

<<<<<<< HEAD
    // Remove sensitive data
=======
    // Remove sensitive fields
>>>>>>> 063705e (Initial commit)
    const { passwordHash: _, encryptedKey: __, ...safeUser } = user

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
