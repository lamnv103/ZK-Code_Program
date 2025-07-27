import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient, Prisma } from "@prisma/client"
import jwt from "jsonwebtoken"
import { simpleEncrypt, simpleDecrypt, generateCommitment } from "@/lib/encryption"

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

    const depositAmount = new Prisma.Decimal(amount.toString())

    // 2. Fetch user and their balance
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { balance: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 3. Decrypt current balance or use default
    let currentBalance = new Prisma.Decimal("1000") // Default starting balance

    if (user.balance?.encryptedBalance) {
      try {
        const decryptedBalance = simpleDecrypt(user.balance.encryptedBalance)
        currentBalance = new Prisma.Decimal(decryptedBalance)
      } catch (decryptionError) {
        console.warn("Failed to decrypt balance, using default:", decryptionError)
        // Keep default balance if decryption fails
      }
    }

    const newBalance = currentBalance.plus(depositAmount)

    // 4. Encrypt new balance
    const newEncryptedBalance = simpleEncrypt(newBalance.toString())
    const newCommitment = generateCommitment(newBalance.toString())

    // 5. Update user's balance and create deposit record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      if (user.balance) {
        await tx.balance.update({
          where: { userId: user.id },
          data: {
            encryptedBalance: newEncryptedBalance,
            commitment: newCommitment,
            lastUpdated: new Date(),
          },
        })
      } else {
        // Create balance record if it doesn't exist (first deposit)
        await tx.balance.create({
          data: {
            userId: user.id,
            encryptedBalance: newEncryptedBalance,
            commitment: newCommitment,
          },
        })
      }

      const deposit = await tx.deposit.create({
        data: {
          userId: user.id,
          amount: depositAmount,
          status: "completed",
          virtualQrCodeUrl: `/placeholder.svg?height=200&width=200&query=QR%20code%20for%20${amount}%20ETH`,
        },
      })
      return deposit
    })

    return NextResponse.json({
      success: true,
      deposit: {
        id: result.id,
        amount: result.amount.toString(),
        status: result.status,
        createdAt: result.createdAt,
      },
      newBalance: newBalance.toString(),
      message: "Deposit successful and balance updated.",
    })
  } catch (error) {
    console.error("Deposit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
