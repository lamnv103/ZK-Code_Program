import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { ZKProofCore } from "@/lib/zkp-core"
import { BalanceManager } from "@/lib/balance-manager"

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { transferAmount, recipientAddress } = await request.json()

    // Validate input
    if (!transferAmount || !recipientAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transferAmountBigInt = BigInt(Math.floor(Number.parseFloat(transferAmount) * 1000000000000000000)) // Convert to wei

    console.log("🚀 Starting ZK proof generation for transfer:", {
      userId: decoded.userId,
      transferAmount,
      recipientAddress,
    })

    // 2. Get user balance
    const balanceManager = BalanceManager.getInstance()
    const balanceInfo = await balanceManager.getUserBalance(decoded.userId)

    if (!balanceInfo) {
      return NextResponse.json({ error: "Balance not found", message: "User balance not initialized" }, { status: 404 })
    }

    // 3. Check balance sufficiency
    const balanceCheck = await balanceManager.checkSufficientBalance(decoded.userId, transferAmount)

    if (!balanceCheck.hasSufficientBalance) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          message: balanceCheck.message,
          currentBalance: balanceCheck.currentBalance,
        },
        { status: 400 },
      )
    }

    // 4. Generate ZK proof
    const zkProofCore = ZKProofCore.getInstance()
    const currentBalanceBigInt = BigInt(
      Math.floor(Number.parseFloat(balanceInfo.decryptedBalance) * 1000000000000000000),
    )

    const zkProofResult = await zkProofCore.createTransferProof(currentBalanceBigInt, transferAmountBigInt)

    // 5. Calculate transfer details
    const newBalance = (Number.parseFloat(balanceInfo.decryptedBalance) - Number.parseFloat(transferAmount)).toString()

    const transferDetails = {
      amount: transferAmount,
      amountWei: transferAmountBigInt.toString(),
      recipientAddress,
      currentBalance: balanceInfo.decryptedBalance,
      newBalance,
    }

    const proofMetadata = {
      userId: decoded.userId,
      timestamp: new Date().toISOString(),
      balanceCommitment: zkProofResult.balanceCommitment,
      nullifierHash: zkProofResult.nullifierHash,
      verificationTime: zkProofResult.metadata.verificationTime,
    }

    console.log("✅ ZK proof generated successfully:", {
      verificationTime: zkProofResult.metadata.verificationTime,
      isValid: zkProofResult.publicSignals[3] === "1",
    })

    return NextResponse.json({
      success: true,
      zkProof: {
        proof: zkProofResult.proof,
        publicSignals: zkProofResult.publicSignals,
        balanceCommitment: zkProofResult.balanceCommitment,
        nullifierHash: zkProofResult.nullifierHash,
        newBalanceCommitment: zkProofResult.newBalanceCommitment,
      },
      transferDetails,
      proofMetadata,
      message: "Zero-knowledge proof generated successfully",
    })
  } catch (error) {
    console.error("❌ ZK proof generation error:", error)
    return NextResponse.json(
      {
        error: "Proof generation failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
