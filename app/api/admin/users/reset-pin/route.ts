import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Generate new 6-digit PIN
    const newPin = Math.floor(100000 + Math.random() * 900000).toString()

    // Trong thực tế sẽ:
    // 1. Hash PIN mới
    // 2. Cập nhật database
    // 3. Gửi email/SMS thông báo cho user
    console.log(`Resetting PIN for user ${userId}`)

    // Log security event
    const securityLog = {
      action: "RESET_USER_PIN",
      userId,
      adminId: "admin_001", // Lấy từ session
      timestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
      reason: "Admin reset",
    }

    console.log("Security log:", securityLog)

    // Simulate database update
    await new Promise((resolve) => setTimeout(resolve, 200))

    return NextResponse.json({
      success: true,
      message: "PIN has been reset successfully",
      newPin, // Trong thực tế không trả về PIN, chỉ gửi qua email/SMS
      userId,
    })
  } catch (error) {
    console.error("Error resetting PIN:", error)
    return NextResponse.json({ error: "Failed to reset PIN" }, { status: 500 })
  }
}
