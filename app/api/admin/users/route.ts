import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [{ email: { contains: search } }, { walletAddress: { contains: search } }]
    }

    // Get users with related data
    const users = await prisma.user.findMany({
      where,
      include: {
        balance: {
          select: {
            lastUpdated: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count
    const total = await prisma.user.count({ where })

    // Remove sensitive data
    const safeUsers = users.map((user) => {
      const { passwordHash, encryptedKey, ...safeUser } = user
      return safeUser
    })

    return NextResponse.json({
      success: true,
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
