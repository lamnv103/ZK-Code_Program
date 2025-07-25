import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { toAddress, amount, zkProof } = await request.json()

    // Validate input
    if (!toAddress || !amount || !zkProof) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Simulate ZK Proof verification (in real implementation, this would be actual verification)
    const isValidProof = Math.random() > 0.1 // 90% success rate

    if (!isValidProof) {
      return NextResponse.json({ error: "Invalid ZK Proof" }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { balance: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create transaction with ZK proof
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          fromAddress: user.walletAddress,
          toAddress,
          amount: Number.parseFloat(amount),
          status: "verified",
          zkProofHash: zkProof.proofHash || crypto.randomBytes(16).toString("hex"),
        },
      })

      // Create ZK proof record
      const zkProofRecord = await tx.zkProof.create({
        data: {
          transactionId: transaction.id,
          proofData: zkProof.proof,
          publicSignals: zkProof.publicSignals,
        },
      })

      // Update balance (simulate balance update)
      await tx.balance.update({
        where: { userId: user.id },
        data: {
          lastUpdated: new Date(),
          // In real implementation, update encrypted balance
        },
      })

      return { transaction, zkProof: zkProofRecord }
    })

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      zkProof: result.zkProof,
      message: "Transaction created successfully",
    })
  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
