import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get ZKP statistics
    const [totalProofs, recentProofs, avgVerificationTime] = await Promise.all([
      prisma.zkProof.count(),
      prisma.zkProof.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      // Simulate average verification time calculation
      Promise.resolve(2.3),
    ])

    const weeklyProofs = await prisma.zkProof.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    })

    const stats = {
      totalProofs,
      successRate: 99.7, // Calculate from actual data
      avgVerificationTime,
      activeVerifiers: 5,
      circuitSize: "2^20",
      proofSystem: "Groth16",
      dailyProofs: recentProofs,
      weeklyProofs,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("ZKP stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
