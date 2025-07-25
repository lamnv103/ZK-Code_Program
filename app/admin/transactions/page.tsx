"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react"

interface Transaction {
  id: string
  fromAddress: string
  toAddress: string
  amount: string
  status: string
  createdAt: string
  zkProofHash: string
  userId: string
}

interface TransactionStats {
  totalTransactions: number
  verifiedTransactions: number
  pendingTransactions: number
  failedTransactions: number
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "verified":
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
      return <Badge className="bg-green-100 text-green-800">✅ Đã xác minh</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ Đang xử lý</Badge>
    case "failed":
      return <Badge className="bg-red-100 text-red-800">❌ Thất bại</Badge>
    default:
      return null
  }
}

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch transactions and stats
      const [transactionsRes, statsRes] = await Promise.all([
        fetch("/api/admin/transactions"),
        fetch("/api/admin/stats"),
      ])

      if (!transactionsRes.ok || !statsRes.ok) {
        throw new Error("Không thể tải dữ liệu")
      }

      const [transactionsData, statsData] = await Promise.all([transactionsRes.json(), statsRes.json()])

      setTransactions(transactionsData.transactions || [])
      setStats({
        totalTransactions: statsData.stats.totalTransactions,
        verifiedTransactions: statsData.stats.verifiedTransactions,
        pendingTransactions: statsData.stats.pendingTransactions,
        failedTransactions:
          statsData.stats.totalTransactions -
          statsData.stats.verifiedTransactions -
          statsData.stats.pendingTransactions,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <h1 className="text-3xl font-bold mb-2">Quản lý giao dịch</h1>
          <p className="text-muted-foreground">Giám sát và xác minh tất cả giao dịch trong hệ thống</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tìm kiếm và lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo ID giao dịch, địa chỉ ví..."
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

        {/* Transaction Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã xác minh</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.verifiedTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTransactions > 0
                    ? ((stats.verifiedTransactions / stats.totalTransactions) * 100).toFixed(1)
                    : 0}
                  % tổng số
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thất bại</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failedTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTransactions > 0
                    ? ((stats.failedTransactions / stats.totalTransactions) * 100).toFixed(1)
                    : 0}
                  % tổng số
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách giao dịch</CardTitle>
            <CardDescription>Tất cả giao dịch được sắp xếp theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không có giao dịch nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="font-medium">TX #{tx.id}</span>
                        {getStatusBadge(tx.status)}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{tx.amount} ETH</div>
                        <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div>
                          <span className="text-muted-foreground">Từ: </span>
                          <code className="bg-muted px-1 py-0.5 rounded">{tx.fromAddress}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Đến: </span>
                          <code className="bg-muted px-1 py-0.5 rounded">{tx.toAddress}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ZK Proof: </span>
                          <code className="bg-muted px-1 py-0.5 rounded">{tx.zkProofHash}</code>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="pt-2">
                          <Button size="sm" variant="outline">
                            Xem chi tiết
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
      </div>
    </div>
  )
}
