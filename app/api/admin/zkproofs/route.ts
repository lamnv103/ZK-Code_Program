import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get ZK proofs with transaction data
    const zkProofs = await prisma.zkProof.findMany({
      include: {
        transaction: {
          select: {
            id: true,
            fromAddress: true,
            toAddress: true,
            amount: true,
            status: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count
    const total = await prisma.zkProof.count()

    return NextResponse.json({
      success: true,
      zkProofs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin ZK proofs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
