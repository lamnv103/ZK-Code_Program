import { type NextRequest, NextResponse } from "next/server"

// Mock data - trong thực tế sẽ lấy từ database
const mockUsers = [
  {
    id: "user_001",
    email: "nguyen.van.a@example.com",
    name: "Nguyễn Văn A",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    status: "active",
    createdAt: "2024-01-15T08:30:00Z",
    lastLoginAt: "2024-01-30T14:22:00Z",
    totalTransactions: 15,
    totalDeposits: 3,
    balance: 2500000,
    hasTransactions: true,
  },
  {
    id: "user_002",
    email: "tran.thi.b@example.com",
    name: "Trần Thị B",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    status: "active",
    createdAt: "2024-01-20T10:15:00Z",
    lastLoginAt: "2024-01-29T16:45:00Z",
    totalTransactions: 8,
    totalDeposits: 2,
    balance: 1800000,
    hasTransactions: true,
  },
  {
    id: "user_003",
    email: "le.van.c@example.com",
    name: "Lê Văn C",
    walletAddress: "0x567890abcdef1234567890abcdef1234567890ab",
    status: "suspended",
    createdAt: "2024-01-10T09:20:00Z",
    lastLoginAt: "2024-01-25T11:30:00Z",
    totalTransactions: 25,
    totalDeposits: 5,
    balance: 500000,
    hasTransactions: true,
  },
  {
    id: "user_004",
    email: "pham.thi.d@example.com",
    name: "Phạm Thị D",
    walletAddress: "0x890abcdef1234567890abcdef1234567890abcdef",
    status: "inactive",
    createdAt: "2024-01-25T13:45:00Z",
    lastLoginAt: null,
    totalTransactions: 0,
    totalDeposits: 1,
    balance: 1000000,
    hasTransactions: false,
  },
  {
    id: "user_005",
    email: "hoang.van.e@example.com",
    name: "Hoàng Văn E",
    walletAddress: "0xdef1234567890abcdef1234567890abcdef123456",
    status: "active",
    createdAt: "2024-01-28T15:10:00Z",
    lastLoginAt: "2024-01-30T09:15:00Z",
    totalTransactions: 12,
    totalDeposits: 4,
    balance: 3200000,
    hasTransactions: true,
  },
  {
    id: "user_006",
    email: "vo.thi.f@example.com",
    name: "Võ Thị F",
    walletAddress: "0x234567890abcdef1234567890abcdef1234567890",
    status: "active",
    createdAt: "2024-01-12T07:25:00Z",
    lastLoginAt: "2024-01-29T20:30:00Z",
    totalTransactions: 6,
    totalDeposits: 2,
    balance: 750000,
    hasTransactions: true,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Filter users
    const filteredUsers = mockUsers.filter((user) => {
      const matchesSearch =
        search === "" ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.walletAddress.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = status === "all" || user.status === status

      return matchesSearch && matchesStatus
    })

    // Sort users
    filteredUsers.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a]
      let bValue: any = b[sortBy as keyof typeof b]

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return sortOrder === "asc" ? -1 : 1
      if (bValue === null) return sortOrder === "asc" ? 1 : -1

      // Convert to comparable values
      if (sortBy === "createdAt" || sortBy === "lastLoginAt") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    // Paginate
    const startIndex = (page - 1) * limit
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
