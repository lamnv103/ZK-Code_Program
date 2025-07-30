import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(request: Request) {
  try {
    const { transactionIds, status, reason } = await request.json()

    // Validate input
    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ error: "Transaction IDs array is required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const validStatuses = ["pending", "verified", "failed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be one of: pending, verified, failed" }, { status: 400 })
    }

    // Update multiple transactions
    const updateResult = await prisma.transaction.updateMany({
      where: {
        id: {
          in: transactionIds,
        },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    })

    // Log the bulk update
    console.log(`Bulk updated ${updateResult.count} transactions to status: ${status}`, {
      transactionIds,
      reason,
    })

    return NextResponse.json({
      success: true,
      updatedCount: updateResult.count,
      message: `Successfully updated ${updateResult.count} transactions to ${status}`,
    })
  } catch (error) {
    console.error("Bulk update transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
