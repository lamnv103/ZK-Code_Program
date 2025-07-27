import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

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

    // Generate wallet address (simplified)
    const walletAddress = "0x" + crypto.randomBytes(20).toString("hex")

    // Generate and encrypt private key
    const privateKey = crypto.randomBytes(32).toString("hex")
    const encryptedKey = crypto.createCipher("aes-256-cbc", password).update(privateKey, "utf8", "hex")

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
            encryptedBalance: crypto.createCipher("aes-256-cbc", privateKey).update("1000", "utf8", "hex"), // Initial balance of 1000
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

    // Remove sensitive data
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
