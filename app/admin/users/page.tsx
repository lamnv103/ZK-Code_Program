"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserCheck, UserX, Search, Filter } from "lucide-react"

interface User {
  id: string
  email: string
  walletAddress: string
  status: string
  createdAt: string
  updatedAt: string
  balance?: {
    lastUpdated: string
  }
  _count: {
    transactions: number
  }
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  suspendedUsers: number
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">🟢 Hoạt động</Badge>
    case "inactive":
      return <Badge className="bg-gray-100 text-gray-800">⚪ Không hoạt động</Badge>
    case "suspended":
      return <Badge className="bg-red-100 text-red-800">🔴 Tạm khóa</Badge>
    default:
      return null
  }
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([fetch("/api/admin/users"), fetch("/api/admin/stats")])

      if (!usersRes.ok || !statsRes.ok) {
        throw new Error("Không thể tải dữ liệu")
      }

      const [usersData, statsData] = await Promise.all([usersRes.json(), statsRes.json()])

      setUsers(usersData.users || [])
      setStats({
        totalUsers: statsData.stats.totalUsers,
        activeUsers: statsData.stats.activeUsers,
        inactiveUsers: statsData.stats.totalUsers - statsData.stats.activeUsers,
        suspendedUsers: 0, // Calculate from actual data if needed
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quản lý người dùng</h1>
          <p className="text-muted-foreground">Quản lý tài khoản và ví người dùng trong hệ thống</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tìm kiếm người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo email, địa chỉ ví, ID..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% tổng số
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Không hoạt động</CardTitle>
                <Users className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.inactiveUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? ((stats.inactiveUsers / stats.totalUsers) * 100).toFixed(1) : 0}% tổng số
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tạm khóa</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.suspendedUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? ((stats.suspendedUsers / stats.totalUsers) * 100).toFixed(1) : 0}% tổng số
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
            <CardDescription>Tất cả người dùng được sắp xếp theo thời gian tham gia</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không có người dùng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.email}</span>
                            {getStatusBadge(user.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id} | Tham gia: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div>
                          <span className="text-muted-foreground">Địa chỉ ví: </span>
                          <code className="bg-muted px-1 py-0.5 rounded">{user.walletAddress}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hoạt động cuối: </span>
                          <span>{new Date(user.updatedAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-muted-foreground">Tổng giao dịch: </span>
                          <span className="font-medium">{user._count.transactions}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Chi tiết
                        </Button>
                        {user.status === "active" ? (
                          <Button size="sm" variant="outline">
                            Tạm khóa
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            Kích hoạt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
