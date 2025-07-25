import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get system statistics
    const [totalUsers, activeUsers, totalTransactions, pendingTransactions, verifiedTransactions, totalZkProofs] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "active" } }),
        prisma.transaction.count(),
        prisma.transaction.count({ where: { status: "pending" } }),
        prisma.transaction.count({ where: { status: "verified" } }),
        prisma.zkProof.count(),
      ])

    // Get transaction volume
    const volumeResult = await prisma.transaction.aggregate({
      where: { status: "verified" },
      _sum: { amount: true },
    })

    // Calculate success rate
    const successRate = totalTransactions > 0 ? ((verifiedTransactions / totalTransactions) * 100).toFixed(1) : "0"

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalTransactions,
        pendingTransactions,
        verifiedTransactions,
        totalZkProofs,
        totalVolume: volumeResult._sum.amount || 0,
        successRate: Number.parseFloat(successRate),
        systemStatus: "healthy",
        uptime: process.uptime(),
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
