import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { simpleDecrypt } from "@/lib/encryption"

const prisma = new PrismaClient()

// Add rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { attempts: number; lastAttempt: number }>()

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // Rate limiting - max 5 attempts per minute per user
    const userId = decoded.userId
    const now = Date.now()
    const userRateLimit = rateLimitMap.get(userId) || { attempts: 0, lastAttempt: 0 }

    // Reset attempts if more than 1 minute has passed
    if (now - userRateLimit.lastAttempt > 60000) {
      userRateLimit.attempts = 0
    }

    if (userRateLimit.attempts >= 5) {
      return NextResponse.json(
        {
          error: "Too many attempts",
          message: "Quá nhiều lần thử. Vui lòng đợi 1 phút.",
        },
        { status: 429 },
      )
    }

    const { pin } = await request.json()

    // Validate PIN
    if (!pin || pin.length !== 6) {
      // Increment attempts on invalid format
      rateLimitMap.set(userId, { attempts: userRateLimit.attempts + 1, lastAttempt: now })
      return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 })
    }

    // 2. Get user with balance
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { balance: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 3. Verify PIN - use stored PIN from database
    const storedPin = user.transferPin || "123456" // Get from database, fallback to demo PIN
    const isValidPin = pin === storedPin

    if (!isValidPin) {
      // Increment attempts on wrong PIN
      rateLimitMap.set(userId, { attempts: userRateLimit.attempts + 1, lastAttempt: now })
      return NextResponse.json(
        {
          error: "Invalid PIN",
          message: "Mã PIN không đúng",
        },
        { status: 400 },
      )
    }

    // Reset attempts on successful PIN
    rateLimitMap.set(userId, { attempts: 0, lastAttempt: now })

    // 4. Decrypt and return balance
    let currentBalance = "1000" // Default balance

    if (user.balance?.encryptedBalance) {
      try {
        currentBalance = simpleDecrypt(user.balance.encryptedBalance)
      } catch (error) {
        console.warn("Failed to decrypt balance:", error)
      }
    }

    // 5. Get recent transactions for context
    const recentTransactions = await prisma.transaction.count({
      where: { userId: user.id },
    })

    const recentDeposits = await prisma.deposit.count({
      where: { userId: user.id },
    })

    return NextResponse.json({
      success: true,
      balance: currentBalance,
      walletAddress: user.walletAddress,
      lastUpdated: user.balance?.lastUpdated || user.createdAt,
      stats: {
        totalTransactions: recentTransactions,
        totalDeposits: recentDeposits,
      },
      message: "Số dư đã được hiển thị",
    })
  } catch (error) {
    console.error("Balance view error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
