import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    // Mock activity log data
    const mockActivities = [
      {
        id: "activity_001",
        userId,
        action: "LOGIN",
        description: "Đăng nhập thành công",
        timestamp: "2024-01-30T14:22:00Z",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: "activity_002",
        userId,
        action: "TRANSFER",
        description: "Chuyển 500,000 VND đến 0xabc...def",
        timestamp: "2024-01-30T14:25:00Z",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: "activity_003",
        userId,
        action: "VIEW_BALANCE",
        description: "Xem số dư tài khoản",
        timestamp: "2024-01-30T14:20:00Z",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: "activity_004",
        userId,
        action: "DEPOSIT",
        description: "Nạp 1,000,000 VND vào tài khoản",
        timestamp: "2024-01-29T16:45:00Z",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: "activity_005",
        userId,
        action: "CHANGE_PIN",
        description: "Thay đổi mã PIN",
        timestamp: "2024-01-28T10:30:00Z",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    ]

    // Sort by timestamp (newest first) and limit
    const activities = mockActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      activities,
      total: mockActivities.length,
      userId,
    })
  } catch (error) {
    console.error("Error fetching activity log:", error)
    return NextResponse.json({ error: "Failed to fetch activity log" }, { status: 500 })
  }
}
