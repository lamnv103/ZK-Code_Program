import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    const { transactionId, status } = await request.json()

    // Validate input
    if (!transactionId || !status) {
      return NextResponse.json({ error: "Transaction ID and status are required" }, { status: 400 })
    }

    const validStatuses = ["pending", "verified", "failed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be one of: pending, verified, failed" }, { status: 400 })
    }

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        updatedAt: new Date(),
      },
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
    })

    // Log the status change (in production, you might want to create an audit log)
    console.log(`Transaction ${transactionId} status changed from ${existingTransaction.status} to ${status}`)

    return NextResponse.json({
      success: true,
      transaction: {
        id: updatedTransaction.id,
        status: updatedTransaction.status,
        updatedAt: updatedTransaction.updatedAt.toISOString(),
      },
      message: `Transaction status updated to ${status}`,
    })
  } catch (error) {
    console.error("Update transaction status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
