import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get transaction statistics
    const [totalTransactions, verifiedTransactions, pendingTransactions, failedTransactions, volumeResult] =
      await Promise.all([
        prisma.transaction.count(),
        prisma.transaction.count({ where: { status: "verified" } }),
        prisma.transaction.count({ where: { status: "pending" } }),
        prisma.transaction.count({ where: { status: "failed" } }),
        prisma.transaction.aggregate({
          where: { status: "verified" },
          _sum: { amount: true },
          _avg: { amount: true },
        }),
      ])

    // Get transactions by day for the last 7 days
    const transactionsByDay = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const [count, volume] = await Promise.all([
        prisma.transaction.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        }),
        prisma.transaction.aggregate({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
            status: "verified",
          },
          _sum: { amount: true },
        }),
      ])

      transactionsByDay.push({
        date: dayStart.toISOString().split("T")[0],
        count,
        volume: volume._sum.amount?.toString() || "0",
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalTransactions,
        verifiedTransactions,
        pendingTransactions,
        failedTransactions,
        totalVolume: volumeResult._sum.amount?.toString() || "0",
        avgTransactionValue: volumeResult._avg.amount?.toString() || "0",
        transactionsByDay,
      },
    })
  } catch (error) {
    console.error("Transaction stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
