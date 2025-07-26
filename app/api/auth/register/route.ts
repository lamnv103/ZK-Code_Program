import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const walletAddress = "0x" + crypto.randomBytes(20).toString("hex")

    const privateKey = crypto.randomBytes(32).toString("hex")
    const iv = crypto.randomBytes(16)
    const key = crypto.createHash("sha256").update(password).digest()
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv)
    let encryptedKey = cipher.update(privateKey, "utf8", "hex")
    encryptedKey += cipher.final("hex")

    // Encrypt balance
    const balanceKey = crypto.createHash("sha256").update(privateKey).digest()
    const balanceIv = crypto.randomBytes(16)
    const balanceCipher = crypto.createCipheriv("aes-256-cbc", balanceKey, balanceIv)
    let encryptedBalance = balanceCipher.update("1000", "utf8", "hex")
    encryptedBalance += balanceCipher.final("hex")

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        walletAddress,
        encryptedKey,
        status: "active",
        balance: {
          create: {
            encryptedBalance,
            commitment: crypto
              .createHash("sha256")
              .update("1000" + crypto.randomBytes(16).toString("hex"))
              .digest("hex"),
          },
        },
      },
      include: {
        balance: true,
      },
    })

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
