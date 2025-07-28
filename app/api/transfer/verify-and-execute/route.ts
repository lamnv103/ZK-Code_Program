import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { ZKProofCore } from "@/lib/zkp-core"
import { BalanceManager } from "@/lib/balance-manager"

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

    const { zkProof, transferDetails, proofMetadata, recipientId, transferPin, description } = await request.json()

    // Validate input
    if (!zkProof || !transferDetails || !recipientId || !transferPin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("🔍 Starting ZK proof verification and transfer execution...")

    // 2. Get sender and recipient
    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({ where: { id: decoded.userId } }),
      prisma.user.findUnique({ where: { id: recipientId } }),
    ])

    if (!sender || !recipient) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 3. Verify transfer PIN
    const storedPin = sender.transferPin || "123456" // Demo PIN
    if (transferPin !== storedPin) {
      return NextResponse.json({ error: "Invalid PIN", message: "Transfer PIN is incorrect" }, { status: 400 })
    }

    // 4. Verify ZK proof
    const zkProofCore = ZKProofCore.getInstance()
    const verificationResult = await zkProofCore.verifyBalanceProof(zkProof.proof, zkProof.publicSignals)

    if (!verificationResult.isValid) {
      return NextResponse.json(
        {
          error: "Invalid ZK proof",
          message: "Zero-knowledge proof verification failed",
        },
        { status: 400 },
      )
    }

    console.log("✅ ZK proof verified successfully in", verificationResult.verificationTime, "ms")

    // 5. Execute balance transfer
    const balanceManager = BalanceManager.getInstance()
    const transferResult = await balanceManager.transferBalance(decoded.userId, recipientId, transferDetails.amount)

    if (!transferResult.success) {
      return NextResponse.json({ error: "Transfer failed", message: transferResult.message }, { status: 400 })
    }

    // 6. Create transaction records
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Create transfer record
      const transfer = await tx.transfer.create({
        data: {
          fromUserId: decoded.userId,
          toUserId: recipientId,
          fromWalletAddress: sender.walletAddress,
          toWalletAddress: recipient.walletAddress,
          amount: Number.parseFloat(transferDetails.amount),
          status: "completed",
          description: description || null,
        },
      })

      // Create ZK proof record
      const zkProofRecord = await tx.zkProof.create({
        data: {
          transactionId: transfer.id,
          proofData: zkProof.proof,
          publicSignals: zkProof.publicSignals,
          balanceCommitment: zkProof.balanceCommitment,
          nullifierHash: zkProof.nullifierHash,
          verificationTime: verificationResult.verificationTime,
        },
      })

      return { transfer, zkProofRecord }
    })

    console.log("🎉 Transfer completed successfully:", {
      transferId: transactionResult.transfer.id,
      amount: transferDetails.amount,
      from: sender.email,
      to: recipient.email,
    })

    return NextResponse.json({
      success: true,
      transfer: {
        id: transactionResult.transfer.id,
        amount: transferDetails.amount,
        recipient: {
          email: recipient.email,
          name: recipient.name || recipient.email.split("@")[0],
          walletAddress: recipient.walletAddress,
        },
        status: "completed",
        createdAt: transactionResult.transfer.createdAt,
      },
      balanceUpdate: {
        previousBalance: transferDetails.currentBalance,
        newBalance: transferResult.newFromBalance,
      },
      zkProofVerification: {
        proofId: transactionResult.zkProofRecord.id,
        verificationTime: verificationResult.verificationTime,
        balanceCommitment: zkProof.balanceCommitment,
        nullifierHash: zkProof.nullifierHash,
      },
      message: "Transfer completed successfully with zero-knowledge proof verification",
    })
  } catch (error) {
    console.error("❌ Transfer execution error:", error)
    return NextResponse.json(
      {
        error: "Transfer failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
