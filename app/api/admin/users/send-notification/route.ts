import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, message, type = "info" } = await request.json()

    if (!userId || !message) {
      return NextResponse.json({ error: "Missing userId or message" }, { status: 400 })
    }

    // Trong thực tế sẽ:
    // 1. Lấy thông tin user từ database
    // 2. Gửi email/SMS/push notification
    // 3. Lưu notification vào database
    console.log(`Sending notification to user ${userId}:`, { message, type })

    // Simulate notification sending
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Log notification
    const notificationLog = {
      action: "SEND_NOTIFICATION",
      userId,
      message,
      type,
      adminId: "admin_001", // Lấy từ session
      timestamp: new Date().toISOString(),
      status: "sent",
    }

    console.log("Notification log:", notificationLog)

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      userId,
      notificationId: `notif_${Date.now()}`,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
