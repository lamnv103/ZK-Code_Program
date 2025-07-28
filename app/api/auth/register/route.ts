import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

// Cấu hình thuật toán mã hóa
const ALGORITHM = "aes-256-cbc"
const KEY_LENGTH = 32
const IV_LENGTH = 16

function deriveKey(password: string): Buffer {
  return crypto.scryptSync(password, "user_salt", KEY_LENGTH)
}

function encryptWithIv(data: string, password: string): string {
  const key = deriveKey(password)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()])
  return iv.toString("hex") + ":" + encrypted.toString("hex")
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Kiểm tra user tồn tại
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Băm password
    const passwordHash = await bcrypt.hash(password, 12)

    // Tạo ví đơn giản
    const walletAddress = "0x" + crypto.randomBytes(20).toString("hex")

    // Tạo và mã hóa private key
    const privateKey = crypto.randomBytes(32).toString("hex")
    const encryptedKey = encryptWithIv(privateKey, password)

    // Mã hóa số dư ban đầu
    const initialBalance = "1000"
    const encryptedBalance = encryptWithIv(initialBalance, privateKey)

    // Tạo commitment cho số dư
    const nonce = crypto.randomBytes(16).toString("hex")
    const commitment = crypto.createHash("sha256").update(initialBalance + nonce).digest("hex")

    // Lưu user vào database
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
            encryptedBalance,
            commitment,
          },
        },
      },
      include: { balance: true },
    })

    // Loại bỏ dữ liệu nhạy cảm
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
