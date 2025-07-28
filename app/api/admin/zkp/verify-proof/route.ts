import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { ZKProofCore } from "@/lib/zkp-core"

const prisma = new PrismaClient()

/*************  ✨ Windsurf Command 🌟  *************/
/**
 * Handle POST request to verify a zero-knowledge proof by admin.
 * 
 * @param request - The incoming HTTP request containing proof details.
 * @returns A JSON response indicating success or failure of the verification process.
 */
export async function POST(request: Request) {
  try {
    // Extract proof data from request
    const { proofId, proof, publicSignals } = await request.json()

    console.log(`🔍 Admin verifying ZK Proof: ${proofId}`)

    // Fetch the proof record from database
    // Find the proof record
    const zkProofRecord = await prisma.zkProof.findUnique({
      where: { id: proofId },
      include: { transaction: true },
    })

    if (!zkProofRecord) {
      // Respond with 404 if proof record not found
      return NextResponse.json({ error: "Proof not found" }, { status: 404 })
    }

    // Verify the proof using the ZKProofCore system
    // Verify the ZK proof using our core system
    const zkProofCore = await ZKProofCore.getInstance()
    const verificationResult = await zkProofCore.verifyProof(
      proof || zkProofRecord.proofData,
      publicSignals || zkProofRecord.publicSignals,
    )

    if (verificationResult.isValid) {
      // Update transaction status to 'verified'
      // Update transaction status
      await prisma.transaction.update({
        where: { id: zkProofRecord.transactionId },
        data: {
          status: "verified",
          updatedAt: new Date(),
        },
      })

      console.log(`✅ ZK Proof ${proofId} verified successfully`)

      // Respond with success message
      return NextResponse.json({
        success: true,
        proofId,
        status: "verified",
        verificationTime: verificationResult.verificationTime + "ms",
        verificationDetails: {
          transferAmount: verificationResult.transferAmount,
          balanceCommitment: verificationResult.balanceCommitment,
          nullifierHash: verificationResult.nullifierHash,
          newBalanceCommitment: verificationResult.newBalanceCommitment,
          circuit: "BalanceCheck",
          proofSystem: "Groth16",
          verified: true,
          timestamp: new Date().toISOString(),
        },
        message: "ZK Proof verified successfully by admin",
      })
    } else {
      console.log(`❌ ZK Proof ${proofId} verification failed`)

      // Respond with failure message
      return NextResponse.json(
        {
          success: false,
          proofId,
          status: "failed",
          verificationTime: verificationResult.verificationTime + "ms",
          error: "Invalid proof or insufficient balance",
          message: "ZK Proof verification failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    // Handle errors during verification process
    console.error("❌ Admin ZKP verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Verification failed",
        message: error instanceof Error ? error.message : "Error verifying proof",
      },
      { status: 500 },
    )
  }
}
/*******  b56f76f9-d353-4efc-8655-2564ae6051b5  *******/
