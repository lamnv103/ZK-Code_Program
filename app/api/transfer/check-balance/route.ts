import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient, Prisma } from "@prisma/client"
import jwt from "jsonwebtoken"
import { simpleDecrypt } from "@/lib/encryption"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { amount } = await request.json()

    // Validate input
    if (!amount || Number.parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const transferAmount = new Prisma.Decimal(amount.toString())

    // 2. Fetch user and their balance
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { balance: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 3. Decrypt and check balance
    let currentBalance = new Prisma.Decimal("1000") // Default balance

    if (user.balance?.encryptedBalance) {
      try {
        const decryptedBalance = simpleDecrypt(user.balance.encryptedBalance)
        currentBalance = new Prisma.Decimal(decryptedBalance)
      } catch (decryptionError) {
        console.warn("Failed to decrypt balance, using default:", decryptionError)
        // Keep default balance if decryption fails
      }
    }

    // 4. Check if balance is sufficient
    const hasSufficientBalance = currentBalance.gte(transferAmount)

    return NextResponse.json({
      success: true,
      hasSufficientBalance,
      currentBalance: currentBalance.toString(),
      transferAmount: transferAmount.toString(),
      message: hasSufficientBalance ? "Số dư đủ để thực hiện giao dịch" : "Số dư không đủ để thực hiện giao dịch",
    })
  } catch (error) {
    console.error("Balance check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
