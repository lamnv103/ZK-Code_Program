import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const { recipientAccount } = await request.json()

    // Validate input
    if (!recipientAccount) {
      return NextResponse.json({ error: "Recipient account is required" }, { status: 400 })
    }

    // 2. Find recipient by email or wallet address
    const recipient = await prisma.user.findFirst({
      where: {
        OR: [{ email: recipientAccount }, { walletAddress: recipientAccount }],
        NOT: {
          id: decoded.userId, // Don't allow self-transfer
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        status: true,
      },
    })

    if (!recipient) {
      return NextResponse.json(
        {
          error: "Recipient not found",
          message: "Không tìm thấy người nhận với thông tin này",
        },
        { status: 404 },
      )
    }

    if (recipient.status !== "active") {
      return NextResponse.json(
        {
          error: "Recipient account inactive",
          message: "Tài khoản người nhận không hoạt động",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      recipient: {
        id: recipient.id,
        email: recipient.email,
        name: recipient.name,
        walletAddress: recipient.walletAddress,
      },
      message: "Tìm thấy người nhận",
    })
  } catch (error) {
    console.error("Find recipient error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
