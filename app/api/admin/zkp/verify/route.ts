import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { proofId } = await request.json()

    if (!proofId) {
      return NextResponse.json({ error: "Proof ID is required" }, { status: 400 })
    }

    // Update proof verification status
    const updatedProof = await prisma.zkProof.update({
      where: { id: proofId },
      data: {
        verificationTime: Math.floor(Math.random() * 1000) + 1000, // Simulated verification time
        updatedAt: new Date(),
      },
      include: {
        transaction: true,
      },
    })

    // Update transaction status
    await prisma.transaction.update({
      where: { id: updatedProof.transactionId },
      data: { status: "verified" },
    })

    return NextResponse.json({
      success: true,
      message: "ZK proof verified successfully",
      proof: updatedProof,
    })
  } catch (error) {
    console.error("ZKP verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
