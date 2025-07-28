import { NextResponse } from "next/server"
import { ZKPService } from "@/lib/zkp-service"

export async function POST(request: Request) {
  try {
    const { proof, publicSignals, transferAmount, balanceCommitment, nullifierHash } = await request.json()

    console.log("🔍 Verifying ZK Proof for Balance Check...")
    console.log("Transfer Amount:", transferAmount)
    console.log("Balance Commitment:", balanceCommitment)
    console.log("Nullifier Hash:", nullifierHash)

    const zkpService = ZKPService.getInstance()

    // Verify the ZK proof using our circuit
    const verificationResult = await zkpService.verifyBalanceProof(proof, publicSignals)

    if (!verificationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ZK Proof",
          message: "Balance proof verification failed",
        },
        { status: 400 },
      )
    }

    // Kiểm tra consistency của public inputs
    const expectedTransferAmount = BigInt(Math.floor(Number.parseFloat(transferAmount) * 1000))
    const proofTransferAmount = BigInt(verificationResult.transferAmount)

    if (proofTransferAmount !== expectedTransferAmount) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount mismatch",
          message: "Proof transfer amount doesn't match request",
        },
        { status: 400 },
      )
    }

    // Kiểm tra balance commitment khớp
    if (verificationResult.balanceCommitment !== balanceCommitment) {
      return NextResponse.json(
        {
          success: false,
          error: "Commitment mismatch",
          message: "Balance commitment doesn't match",
        },
        { status: 400 },
      )
    }

    // Kiểm tra nullifier hash (để tránh double spending)
    if (verificationResult.nullifierHash !== nullifierHash) {
      return NextResponse.json(
        {
          success: false,
          error: "Nullifier mismatch",
          message: "Nullifier hash doesn't match",
        },
        { status: 400 },
      )
    }

    console.log("✅ ZK Proof verification successful!")

    return NextResponse.json({
      success: true,
      message: "Balance ZK Proof verified successfully",
      verificationDetails: {
        circuit: "BalanceCheck",
        proofSystem: "Groth16",
        transferAmount: verificationResult.transferAmount,
        balanceCommitment: verificationResult.balanceCommitment,
        nullifierHash: verificationResult.nullifierHash,
        newBalanceCommitment: verificationResult.newBalanceCommitment,
        verified: true,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ ZKP verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Verification failed",
        message: error instanceof Error ? error.message : "Error verifying balance proof",
      },
      { status: 500 },
    )
  }
}
