import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get ZKP statistics
    const [totalProofs, recentProofs] = await Promise.all([
      prisma.zkProof.count(),
      prisma.zkProof.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          transaction: {
            select: {
              status: true,
              createdAt: true,
            },
          },
        },
      }),
    ])

    // Calculate success rate
    const successfulProofs = recentProofs.filter((p) => p.transaction.status === "verified").length
    const successRate = recentProofs.length > 0 ? (successfulProofs / recentProofs.length) * 100 : 100

    // Calculate average verification time (simulated)
    const avgVerificationTime = 2.3 + (Math.random() - 0.5) * 0.5

    // Generate proofs by day for the last 7 days
    const proofsByDay = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const count = await prisma.zkProof.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      })

      proofsByDay.push({
        date: dayStart.toISOString().split("T")[0],
        count,
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalProofs,
        successRate: Number.parseFloat(successRate.toFixed(1)),
        avgVerificationTime: Number.parseFloat(avgVerificationTime.toFixed(1)),
        activeVerifiers: 5, // This would come from actual service monitoring
        proofsByDay,
      },
    })
  } catch (error) {
    console.error("ZKP stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
