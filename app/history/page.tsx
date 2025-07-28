"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface Transaction {
  id: string
  type: "transfer" | "deposit" | "received"
  fromAddress?: string
  toAddress?: string
  amount: string
  status: string
  createdAt: string
  zkProofHash?: string
  description?: string
  recipient?: {
    name: string
    email: string
  }
  sender?: {
    name: string
    email: string
  }
}

interface TransactionStats {
  totalTransactions: number
  totalSent: string
  totalReceived: string
  totalDeposits: string
  successRate: number
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "verified":
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-600" />
    default:
      return null
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "verified":
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Thành công</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">⏳ Đang xử lý</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">❌ Thất bại</Badge>
    default:
      return null
  }
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "transfer":
      return <ArrowUpRight className="w-4 h-4 text-red-600" />
    case "received":
      return <ArrowDownLeft className="w-4 h-4 text-green-600" />
    case "deposit":
      return <TrendingUp className="w-4 h-4 text-blue-600" />
    default:
      return null
  }
}

const getTransactionTypeLabel = (type: string) => {
  switch (type) {
    case "transfer":
      return "Chuyển đi"
    case "received":
      return "Nhận về"
    case "deposit":
      return "Nạp tiền"
    default:
      return type
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("all")
  const { user, token, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions()
    }
  }, [isAuthenticated])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Không thể tải lịch sử giao dịch")
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const exportTransactions = () => {
    const csvContent = [
      ["Thời gian", "Loại", "Số tiền", "Trạng thái", "Mô tả"].join(","),
      ...filteredTransactions.map((tx) =>
        [
          formatDate(tx.createdAt),
          getTransactionTypeLabel(tx.type),
          `${tx.amount} ETH`,
          tx.status,
          tx.description || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipient?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sender?.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || tx.status === statusFilter
    const matchesType = typeFilter === "all" || tx.type === typeFilter

    let matchesDate = true
    if (dateRange !== "all") {
      const txDate = new Date(tx.createdAt)
      const now = new Date()
      switch (dateRange) {
        case "today":
          matchesDate = txDate.toDateString() === now.toDateString()
          break
        case "week":
          matchesDate = now.getTime() - txDate.getTime() <= 7 * 24 * 60 * 60 * 1000
          break
        case "month":
          matchesDate = now.getTime() - txDate.getTime() <= 30 * 24 * 60 * 60 * 1000
          break
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-yellow-800 mb-4">Vui lòng đăng nhập để xem lịch sử giao dịch</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải lịch sử giao dịch...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Lịch sử giao dịch</h1>
          <p className="text-muted-foreground">Theo dõi tất cả giao dịch của bạn với bảo mật ZK Proof</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã gửi</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.totalSent} ETH</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã nhận</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalReceived} ETH</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm và lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="ID, email, mô tả..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="completed">Thành công</option>
                  <option value="pending">Đang xử lý</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Loại giao dịch</Label>
                <select
                  id="type"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="transfer">Chuyển đi</option>
                  <option value="received">Nhận về</option>
                  <option value="deposit">Nạp tiền</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Thời gian</Label>
                <select
                  id="date"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={exportTransactions} variant="outline" className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Xuất CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách giao dịch ({filteredTransactions.length})</CardTitle>
            <CardDescription>Tất cả giao dịch được sắp xếp theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không có giao dịch nào phù hợp</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tx.status)}
                            <span className="font-medium">
                              {getTransactionTypeLabel(tx.type)} #{tx.id.substring(0, 8)}
                            </span>
                            {getStatusBadge(tx.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            tx.type === "received"
                              ? "text-green-600"
                              : tx.type === "deposit"
                                ? "text-blue-600"
                                : "text-red-600"
                          }`}
                        >
                          {tx.type === "received" ? "+" : tx.type === "deposit" ? "+" : "-"}
                          {tx.amount} ETH
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        {tx.type === "transfer" && tx.recipient && (
                          <div>
                            <span className="text-muted-foreground">Người nhận: </span>
                            <span className="font-medium">{tx.recipient.name}</span>
                            <span className="text-muted-foreground"> ({tx.recipient.email})</span>
                          </div>
                        )}
                        {tx.type === "received" && tx.sender && (
                          <div>
                            <span className="text-muted-foreground">Người gửi: </span>
                            <span className="font-medium">{tx.sender.name}</span>
                            <span className="text-muted-foreground"> ({tx.sender.email})</span>
                          </div>
                        )}
                        {tx.toAddress && (
                          <div>
                            <span className="text-muted-foreground">Địa chỉ: </span>
                            <code className="bg-muted px-1 py-0.5 rounded text-xs">
                              {tx.toAddress.substring(0, 10)}...{tx.toAddress.substring(tx.toAddress.length - 8)}
                            </code>
                          </div>
                        )}
                        {tx.description && (
                          <div>
                            <span className="text-muted-foreground">Ghi chú: </span>
                            <span>{tx.description}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        {tx.zkProofHash && (
                          <div>
                            <span className="text-muted-foreground">ZK Proof: </span>
                            <code className="bg-muted px-1 py-0.5 rounded text-xs">
                              {tx.zkProofHash.substring(0, 16)}...
                            </code>
                          </div>
                        )}
                        <div className="pt-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Lưu ý về quyền riêng tư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>✔️ Số dư tài khoản của bạn luôn được giữ bí mật</p>
              <p>✔️ Chỉ hiển thị thông tin giao dịch công khai: số tiền, người nhận, thời gian</p>
              <p>✔️ Mọi giao dịch được xác minh bằng Zero-Knowledge Proof</p>
              <p>✔️ Không ai có thể biết số dư thực tế của bạn từ lịch sử này</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
