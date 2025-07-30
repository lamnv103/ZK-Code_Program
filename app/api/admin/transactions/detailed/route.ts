import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all transactions with detailed information
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
            name: true,
          },
        },
        zkProof: {
          select: {
            id: true,
            createdAt: true,
            proofData: true,
            publicSignals: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000, // Limit to recent 1000 transactions for performance
    })

    // Transform data to match frontend expectations
    const transformedTransactions = transactions.map((tx) => ({
      id: tx.id,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      amount: tx.amount.toString(),
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
      zkProofHash: tx.zkProofHash,
      userId: tx.userId,
      user: tx.user,
      zkProof: tx.zkProof,
    }))

    return NextResponse.json({
      success: true,
      transactions: transformedTransactions,
      total: transformedTransactions.length,
    })
  } catch (error) {
    console.error("Detailed transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
