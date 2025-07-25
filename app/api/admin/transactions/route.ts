import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all transactions with user info
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
          },
        },
        zkProof: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent 50 transactions
    })

    // Transform data to match frontend expectations
    const transformedTransactions = transactions.map((tx) => ({
      id: tx.id,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      amount: tx.amount.toString(),
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
      zkProofHash: tx.zkProofHash,
      userId: tx.userId,
    }))

    return NextResponse.json({
      success: true,
      transactions: transformedTransactions,
    })
  } catch (error) {
    console.error("Admin transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
