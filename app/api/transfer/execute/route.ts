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

    const { recipientId, amount, transferPin, description } = await request.json()

    // Validate input
    if (!recipientId || !amount || !transferPin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transferAmount = new Prisma.Decimal(amount.toString())

    // 2. Fetch sender and recipient
    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { balance: true },
      }),
      prisma.user.findUnique({
        where: { id: recipientId },
        include: { balance: true },
      }),
    ])

    if (!sender || !recipient) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 3. Verify transfer PIN - use stored PIN from database instead of hardcoded
    const storedPin = sender.transferPin || "123456" // Get from database, fallback to demo PIN
    const isValidPin = transferPin === storedPin
    if (!isValidPin) {
      return NextResponse.json(
        {
          error: "Invalid PIN",
          message: "Mã PIN chuyển tiền không đúng",
        },
        { status: 400 },
      )
    }

    // 4. Decrypt sender's balance and check sufficiency
    let senderBalance = new Prisma.Decimal("1000")
    if (sender.balance?.encryptedBalance) {
      try {
        const decryptedBalance = simpleDecrypt(sender.balance.encryptedBalance)
        senderBalance = new Prisma.Decimal(decryptedBalance)
      } catch (error) {
        console.warn("Failed to decrypt sender balance:", error)
      }
    }

    if (senderBalance.lt(transferAmount)) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          message: "Số dư không đủ để thực hiện giao dịch",
        },
        { status: 400 },
      )
    }

    // 5. Decrypt recipient's balance
    let recipientBalance = new Prisma.Decimal("0")
    if (recipient.balance?.encryptedBalance) {
      try {
        const decryptedBalance = simpleDecrypt(recipient.balance.encryptedBalance)
        recipientBalance = new Prisma.Decimal(decryptedBalance)
      } catch (error) {
        console.warn("Failed to decrypt recipient balance:", error)
      }
    }

    // 6. Calculate new balances
    const newSenderBalance = senderBalance.minus(transferAmount)
    const newRecipientBalance = recipientBalance.plus(transferAmount)

    // 7. Encrypt new balances
    const newSenderEncryptedBalance = simpleEncrypt(newSenderBalance.toString())
    const newRecipientEncryptedBalance = simpleEncrypt(newRecipientBalance.toString())
    const newSenderCommitment = generateCommitment(newSenderBalance.toString())
    const newRecipientCommitment = generateCommitment(newRecipientBalance.toString())

    // 8. Execute transfer in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update sender's balance
      if (sender.balance) {
        await tx.balance.update({
          where: { userId: sender.id },
          data: {
            encryptedBalance: newSenderEncryptedBalance,
            commitment: newSenderCommitment,
            lastUpdated: new Date(),
          },
        })
      }

      // Update or create recipient's balance
      if (recipient.balance) {
        await tx.balance.update({
          where: { userId: recipient.id },
          data: {
            encryptedBalance: newRecipientEncryptedBalance,
            commitment: newRecipientCommitment,
            lastUpdated: new Date(),
          },
        })
      } else {
        await tx.balance.create({
          data: {
            userId: recipient.id,
            encryptedBalance: newRecipientEncryptedBalance,
            commitment: newRecipientCommitment,
          },
        })
      }

      // Create transfer record
      const transfer = await tx.transfer.create({
        data: {
          fromUserId: sender.id,
          toUserId: recipient.id,
          fromWalletAddress: sender.walletAddress,
          toWalletAddress: recipient.walletAddress,
          amount: transferAmount,
          status: "completed",
          description: description || null,
        },
      })

      return transfer
    })

    return NextResponse.json({
      success: true,
      transfer: {
        id: result.id,
        amount: result.amount.toString(),
        recipient: {
          email: recipient.email,
          name: recipient.name,
          walletAddress: recipient.walletAddress,
        },
        status: result.status,
        createdAt: result.createdAt,
      },
      newBalance: newSenderBalance.toString(),
      message: "Chuyển tiền thành công!",
    })
  } catch (error) {
    console.error("Transfer execution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
