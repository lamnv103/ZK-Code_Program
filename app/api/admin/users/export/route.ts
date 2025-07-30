import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Mock data - giống như trong detailed route
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

export async function POST(request: Request) {
  try {
    const { filters, searchTerm, users: userIds } = await request.json()

    // Get detailed user data for export
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      include: {
        balance: {
          select: {
            lastUpdated: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            deposits: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Generate CSV content
    const csvHeaders = [
      "User ID",
      "Email",
      "Name",
      "Wallet Address",
      "Status",
      "Total Transactions",
      "Total Deposits",
      "Created At",
      "Updated At",
      "Balance Last Updated",
    ]

    const csvRows = users.map((user) => [
      user.id,
      user.email,
      user.name || "",
      user.walletAddress,
      user.status,
      user._count.transactions.toString(),
      user._count.deposits.toString(),
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
      user.balance?.lastUpdated.toISOString() || "",
    ])

    // Create CSV content
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = "\uFEFF"
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Apply same filtering logic as detailed route
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

      if (aValue === null && bValue === null) return 0
      if (aValue === null) return sortOrder === "asc" ? -1 : 1
      if (bValue === null) return sortOrder === "asc" ? 1 : -1

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

    // Create CSV content
    const headers = [
      "ID",
      "Email",
      "Tên",
      "Địa chỉ ví",
      "Trạng thái",
      "Ngày tạo",
      "Đăng nhập cuối",
      "Tổng giao dịch",
      "Lần nạp tiền",
      "Số dư (VND)",
      "Có giao dịch",
    ]

    const csvRows = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.id,
          user.email,
          user.name || "",
          user.walletAddress,
          user.status,
          new Date(user.createdAt).toLocaleDateString("vi-VN"),
          user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("vi-VN") : "Chưa đăng nhập",
          user.totalTransactions,
          user.totalDeposits,
          user.balance,
          user.hasTransactions ? "Có" : "Không",
        ]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")

    // Add BOM for UTF-8 support in Excel
    const bom = "\uFEFF"
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting users:", error)
    return NextResponse.json({ error: "Failed to export users" }, { status: 500 })
  }
}
