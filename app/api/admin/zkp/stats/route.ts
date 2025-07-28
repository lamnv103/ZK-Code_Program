import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get ZK proof statistics
    const [totalProofs, verifiedProofs, failedProofs, todayProofs, weekProofs, avgVerificationTime] = await Promise.all(
      [
        prisma.zkProof.count(),
        prisma.zkProof.count({
          where: {
            transaction: {
              status: "verified",
            },
          },
        }),
        prisma.zkProof.count({
          where: {
            transaction: {
              status: "failed",
            },
          },
        }),
        prisma.zkProof.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.zkProof.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.zkProof.aggregate({
          _avg: {
            verificationTime: true,
          },
        }),
      ],
    )

    const successRate = totalProofs > 0 ? ((verifiedProofs / totalProofs) * 100).toFixed(1) : "0"

    const stats = {
      totalProofs,
      successRate: Number.parseFloat(successRate),
      avgVerificationTime: (avgVerificationTime._avg.verificationTime || 2300) / 1000, // Convert to seconds
      activeVerifiers: 5, // Simulated
      circuitSize: "2^20",
      proofSystem: "Groth16",
      dailyProofs: todayProofs,
      weeklyProofs: weekProofs,
      verifiedProofs,
      failedProofs,
      pendingProofs: totalProofs - verifiedProofs - failedProofs,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Admin ZKP stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
