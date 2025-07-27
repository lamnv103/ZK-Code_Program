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

    const { currentPin, newPin, confirmPin } = await request.json()

    // Validate input
    if (!currentPin || !newPin || !confirmPin) {
      return NextResponse.json({ error: "All PIN fields are required" }, { status: 400 })
    }

    if (newPin.length !== 6 || confirmPin.length !== 6 || currentPin.length !== 6) {
      return NextResponse.json({ error: "PIN must be 6 digits" }, { status: 400 })
    }

    if (newPin !== confirmPin) {
      return NextResponse.json(
        {
          error: "PIN mismatch",
          message: "Mã PIN mới và xác nhận không khớp",
        },
        { status: 400 },
      )
    }

    if (currentPin === newPin) {
      return NextResponse.json(
        {
          error: "Same PIN",
          message: "Mã PIN mới phải khác mã PIN hiện tại",
        },
        { status: 400 },
      )
    }

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 3. Verify current PIN
    const storedPin = user.transferPin || "123456" // Default PIN for demo
    const isValidCurrentPin = currentPin === storedPin

    if (!isValidCurrentPin) {
      return NextResponse.json(
        {
          error: "Invalid current PIN",
          message: "Mã PIN hiện tại không đúng",
        },
        { status: 400 },
      )
    }

    // 4. Update PIN (in production, hash the PIN)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        transferPin: newPin, // In production, hash this
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Mã PIN đã được cập nhật thành công",
    })
  } catch (error) {
    console.error("Change PIN error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
