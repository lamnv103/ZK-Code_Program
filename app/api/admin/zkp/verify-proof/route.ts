import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { ZKProofCore } from "@/lib/zkp-core"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { proofId } = await request.json()

    if (!proofId) {
      return NextResponse.json({ error: "Proof ID is required" }, { status: 400 })
    }

    // Get ZK proof from database
    const zkProof = await prisma.zkProof.findUnique({
      where: { id: proofId },
      include: {
        transaction: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                walletAddress: true,
              },
            },
          },
        },
      },
    })

    if (!zkProof) {
      return NextResponse.json({ error: "ZK proof not found" }, { status: 404 })
    }

    console.log("🔍 Admin verifying ZK proof:", proofId)

    // Parse publicSignals to ensure it's string[]
    let publicSignals: string[] = []
    if (typeof zkProof.publicSignals === "string") {
      try {
        const parsed = JSON.parse(zkProof.publicSignals)
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          publicSignals = parsed
        } else {
          throw new Error("Invalid publicSignals format")
        }
      } catch (e) {
        return NextResponse.json({ error: "Invalid publicSignals JSON format" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: "publicSignals must be stored as a JSON string" }, { status: 400 })
    }

    const zkProofCore = ZKProofCore.getInstance()
    const verificationResult = await zkProofCore.verifyBalanceProof(zkProof.proofData as string, publicSignals)

    // Update verification status
    await prisma.zkProof.update({
      where: { id: proofId },
      data: {
        verificationTime: verificationResult.verificationTime,
        updatedAt: new Date(),
      },
    })

    // Update transaction status based on verification
    const newStatus = verificationResult.isValid ? "verified" : "failed"
    await prisma.transaction.update({
      where: { id: zkProof.transactionId },
      data: { status: newStatus },
    })

    console.log(
      verificationResult.isValid ? "✅" : "❌",
      "Admin ZK proof verification:",
      verificationResult.isValid ? "VALID" : "INVALID",
    )

    return NextResponse.json({
      success: true,
      verification: {
        proofId,
        isValid: verificationResult.isValid,
        verificationTime: verificationResult.verificationTime,
        transferAmount: verificationResult.transferAmount,
        balanceCommitment: verificationResult.balanceCommitment,
        nullifierHash: verificationResult.nullifierHash,
        newBalanceCommitment: verificationResult.newBalanceCommitment,
      },
      transaction: {
        id: zkProof.transaction.id,
        amount: zkProof.transaction.amount,
        status: newStatus,
        user: zkProof.transaction.user,
      },
      message: verificationResult.isValid ? "ZK proof verified successfully" : "ZK proof verification failed",
    })
  } catch (error) {
    console.error("❌ Admin ZK proof verification error:", error)
    return NextResponse.json(
      {
        error: "Verification failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
