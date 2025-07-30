import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock data - trong thực tế sẽ tính từ database
    const stats = {
      totalUsers: 156,
      activeUsers: 142,
      newUsersToday: 8,
      suspendedUsers: 12,
      usersWithTransactions: 134,
      inactiveUsers: 2,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch user statistics" }, { status: 500 })
  }
}
