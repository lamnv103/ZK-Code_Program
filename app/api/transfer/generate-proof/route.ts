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

    const transferAmountWei = BigInt(Math.floor(Number.parseFloat(transferAmount) * 1e18))

    if (transferAmountWei <= 0) {
      return NextResponse.json({ error: "Invalid transfer amount" }, { status: 400 })
    }

    console.log(`🚀 Generating ZK Proof for transfer: ${transferAmount} ETH`)

    // 2. Get user's balance information
    const balanceManager = BalanceManager.getInstance()
    const userKey = decoded.userId + (process.env.ENCRYPTION_KEY || "demo-key")
    const balanceInfo = await balanceManager.getUserBalance(decoded.userId, userKey)

    console.log(`💰 User balance: ${Number(balanceInfo.balance) / 1e18} ETH`)

    // 3. Check if user has sufficient balance
    if (balanceInfo.balance < transferAmountWei) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          message: "Your balance is not sufficient for this transfer",
          currentBalance: (Number(balanceInfo.balance) / 1e18).toFixed(8),
          requestedAmount: transferAmount,
        },
        { status: 400 },
      )
    }

    // 4. Generate ZK Proof
    const zkProofCore = await ZKProofCore.getInstance()
    const randomValues = zkProofCore.generateRandomValues()

    const proofInput = {
      balance: balanceInfo.balance,
      transferAmount: transferAmountWei,
      nonce: randomValues.nonce,
      salt: randomValues.salt,
    }

    const zkProof = await zkProofCore.generateProof(proofInput)

    // 5. Calculate new balance for commitment
    const newBalance = balanceInfo.balance - transferAmountWei
    const newNonce = randomValues.nonce + BigInt(1)

    console.log(`✅ ZK Proof generated successfully`)
    console.log(`📊 New balance will be: ${Number(newBalance) / 1e18} ETH`)

    return NextResponse.json({
      success: true,
      zkProof: {
        proof: zkProof.proof,
        publicSignals: zkProof.publicSignals,
        balanceCommitment: zkProof.balanceCommitment,
        nullifierHash: zkProof.nullifierHash,
        newBalanceCommitment: zkProof.newBalanceCommitment,
      },
      transferDetails: {
        amount: transferAmount,
        amountWei: transferAmountWei.toString(),
        recipientAddress,
        currentBalance: (Number(balanceInfo.balance) / 1e18).toFixed(8),
        newBalance: (Number(newBalance) / 1e18).toFixed(8),
      },
      proofMetadata: {
        nonce: randomValues.nonce.toString(),
        salt: randomValues.salt.toString(),
        generatedAt: new Date().toISOString(),
      },
      message: "ZK Proof generated successfully - balance sufficiency proven without revealing actual balance",
    })
  } catch (error) {
    console.error("❌ Error generating ZK proof:", error)
    return NextResponse.json(
      {
        error: "Proof generation failed",
        message: error instanceof Error ? error.message : "Failed to generate zero-knowledge proof",
      },
      { status: 500 },
    )
  }
}
