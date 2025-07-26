import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        balance: {
          select: {
            lastUpdated: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" },
    )

    // Remove sensitive data
    const { passwordHash, encryptedKey, ...safeUser } = user

    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("❌ Error in /api/auth/register:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
