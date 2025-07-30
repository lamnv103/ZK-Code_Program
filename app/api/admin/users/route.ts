import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, status } = await request.json()

    if (!userId || !status) {
      return NextResponse.json({ error: "Missing userId or status" }, { status: 400 })
    }

    if (!["active", "inactive", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Trong thực tế sẽ cập nhật database
    console.log(`Updating user ${userId} status to ${status}`)

    // Log audit trail
    const auditLog = {
      action: "UPDATE_USER_STATUS",
      userId,
      oldStatus: "active", // Lấy từ database
      newStatus: status,
      adminId: "admin_001", // Lấy từ session
      timestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
    }

    console.log("Audit log:", auditLog)

    // Simulate database update
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      userId,
      newStatus: status,
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
