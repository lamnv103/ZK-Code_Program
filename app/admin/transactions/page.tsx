"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  RefreshCw,
  Download,
  Ban,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  fromAddress: string
  toAddress: string
  amount: string
  status: string
  createdAt: string
  updatedAt: string
  zkProofHash: string
  userId: string
  user?: {
    id: string
    email: string
    walletAddress: string
  }
  zkProof?: {
    id: string
    createdAt: string
  }
}

interface TransactionStats {
  totalTransactions: number
  verifiedTransactions: number
  pendingTransactions: number
  failedTransactions: number
  totalVolume: string
  avgTransactionValue: string
  transactionsByDay: Array<{ date: string; count: number; volume: string }>
}

interface FilterOptions {
  status: string
  dateRange: string
  minAmount: string
  maxAmount: string
  userEmail: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

export default function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    dateRange: "all",
    minAmount: "",
    maxAmount: "",
    userEmail: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchTerm, filters])

  const fetchData = async () => {
    try {
      const [transactionsRes, statsRes] = await Promise.all([
        fetch("/api/admin/transactions/detailed"),
        fetch("/api/admin/transactions/stats"),
      ])

      if (!transactionsRes.ok || !statsRes.ok) {
        throw new Error("Không thể tải dữ liệu")
      }

      const [transactionsData, statsData] = await Promise.all([transactionsRes.json(), statsRes.json()])

      setTransactions(transactionsData.transactions || [])
      setStats(statsData.stats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.fromAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.toAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.zkProofHash?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((tx) => tx.status === filters.status)
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date()
      const startDate = new Date()

      switch (filters.dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          startDate.setMonth(now.getMonth() - 3)
          break
      }

      filtered = filtered.filter((tx) => new Date(tx.createdAt) >= startDate)
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter((tx) => Number.parseFloat(tx.amount) >= Number.parseFloat(filters.minAmount))
    }
    if (filters.maxAmount) {
      filtered = filtered.filter((tx) => Number.parseFloat(tx.amount) <= Number.parseFloat(filters.maxAmount))
    }

    // User email filter
    if (filters.userEmail) {
      filtered = filtered.filter((tx) => tx.user?.email.toLowerCase().includes(filters.userEmail.toLowerCase()))
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Transaction]
      let bValue: any = b[filters.sortBy as keyof Transaction]

      if (filters.sortBy === "amount") {
        aValue = Number.parseFloat(a.amount)
        bValue = Number.parseFloat(b.amount)
      } else if (filters.sortBy === "createdAt" || filters.sortBy === "updatedAt") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  const handleUpdateTransactionStatus = async (transactionId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/transactions/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Không thể cập nhật trạng thái")
      }

      // Update local state
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === transactionId ? { ...tx, status: newStatus, updatedAt: new Date().toISOString() } : tx,
        ),
      )

      toast({
        title: "Cập nhật thành công",
        description: `Trạng thái giao dịch đã được cập nhật thành ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Lỗi cập nhật",
        description: error instanceof Error ? error.message : "Không thể cập nhật trạng thái",
        variant: "destructive",
      })
    }
  }

  const handleExportTransactions = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/admin/transactions/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters,
          searchTerm,
          transactions: filteredTransactions.map((tx) => tx.id),
        }),
      })

      if (!response.ok) {
        throw new Error("Không thể xuất dữ liệu")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Xuất dữ liệu thành công",
        description: "File CSV đã được tải xuống",
      })
    } catch (error) {
      toast({
        title: "Lỗi xuất dữ liệu",
        description: error instanceof Error ? error.message : "Không thể xuất dữ liệu",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
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

  const resetFilters = () => {
    setFilters({
      status: "all",
      dateRange: "all",
      minAmount: "",
      maxAmount: "",
      userEmail: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    setSearchTerm("")
  }

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

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
              <Button onClick={fetchData} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
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

        {/* Transaction Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.transactionsByDay.length > 0 && (
                    <>
                      {stats.transactionsByDay[stats.transactionsByDay.length - 1].count >
                      (stats.transactionsByDay[stats.transactionsByDay.length - 2]?.count || 0) ? (
                        <TrendingUp className="w-3 h-3 inline mr-1 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 inline mr-1 text-red-600" />
                      )}
                      {stats.transactionsByDay[stats.transactionsByDay.length - 1].count} hôm nay
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã xác minh</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.verifiedTransactions.toLocaleString()}</div>
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
                <CardTitle className="text-sm font-medium">Tổng khối lượng</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number.parseFloat(stats.totalVolume).toLocaleString()} ETH</div>
                <p className="text-xs text-muted-foreground">
                  TB: {Number.parseFloat(stats.avgTransactionValue).toFixed(4)} ETH/giao dịch
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stats.failedTransactions} giao dịch thất bại</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tìm kiếm và lọc</CardTitle>
            <CardDescription>Tìm kiếm giao dịch theo nhiều tiêu chí khác nhau</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="ID, địa chỉ, email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="verified">Đã xác minh</SelectItem>
                    <SelectItem value="pending">Đang xử lý</SelectItem>
                    <SelectItem value="failed">Thất bại</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRange">Thời gian</Label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoảng thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="today">Hôm nay</SelectItem>
                    <SelectItem value="week">7 ngày qua</SelectItem>
                    <SelectItem value="month">30 ngày qua</SelectItem>
                    <SelectItem value="quarter">3 tháng qua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortBy">Sắp xếp theo</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Thời gian tạo</SelectItem>
                    <SelectItem value="updatedAt">Thời gian cập nhật</SelectItem>
                    <SelectItem value="amount">Số tiền</SelectItem>
                    <SelectItem value="status">Trạng thái</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Số tiền tối thiểu (ETH)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAmount">Số tiền tối đa (ETH)</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  step="0.01"
                  placeholder="1000.00"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Email người dùng</Label>
                <Input
                  id="userEmail"
                  placeholder="user@example.com"
                  value={filters.userEmail}
                  onChange={(e) => setFilters((prev) => ({ ...prev, userEmail: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }))
                }
              >
                {filters.sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Đặt lại bộ lọc
              </Button>
              <Button variant="outline" onClick={handleExportTransactions} disabled={isExporting}>
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Xuất CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} trong tổng số{" "}
            {filteredTransactions.length} giao dịch
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách giao dịch</CardTitle>
            <CardDescription>Tất cả giao dịch được sắp xếp theo bộ lọc đã chọn</CardDescription>
          </CardHeader>
          <CardContent>
            {currentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không có giao dịch nào phù hợp với bộ lọc</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentTransactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="font-medium">TX #{tx.id.substring(0, 8)}</span>
                        {getStatusBadge(tx.status)}
                        {tx.zkProof && (
                          <Badge variant="outline" className="text-xs">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            ZKP
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{Number.parseFloat(tx.amount).toLocaleString()} ETH</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="space-y-1">
                        <div>
                          <span className="text-muted-foreground">Từ: </span>
                          <code className="bg-muted px-1 py-0.5 rounded text-xs">
                            {tx.fromAddress.substring(0, 10)}...{tx.fromAddress.substring(tx.fromAddress.length - 8)}
                          </code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Đến: </span>
                          <code className="bg-muted px-1 py-0.5 rounded text-xs">
                            {tx.toAddress.substring(0, 10)}...{tx.toAddress.substring(tx.toAddress.length - 8)}
                          </code>
                        </div>
                        {tx.user && (
                          <div>
                            <span className="text-muted-foreground">Người dùng: </span>
                            <span className="font-medium">{tx.user.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        {tx.zkProofHash && (
                          <div>
                            <span className="text-muted-foreground">ZK Proof: </span>
                            <code className="bg-muted px-1 py-0.5 rounded text-xs">
                              {tx.zkProofHash.substring(0, 10)}...
                            </code>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Cập nhật: </span>
                          <span>{new Date(tx.updatedAt).toLocaleString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedTransaction(tx)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Chi tiết giao dịch #{tx.id.substring(0, 8)}</DialogTitle>
                            <DialogDescription>Thông tin đầy đủ về giao dịch và ZK Proof</DialogDescription>
                          </DialogHeader>
                          {selectedTransaction && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Transaction ID</Label>
                                  <p className="text-sm text-muted-foreground break-all">{selectedTransaction.id}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Trạng thái</Label>
                                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Số tiền</Label>
                                  <p className="text-lg font-bold">
                                    {Number.parseFloat(selectedTransaction.amount).toLocaleString()} ETH
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Thời gian tạo</Label>
                                  <p className="text-sm">
                                    {new Date(selectedTransaction.createdAt).toLocaleString("vi-VN")}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Địa chỉ gửi</Label>
                                <p className="text-sm text-muted-foreground break-all font-mono">
                                  {selectedTransaction.fromAddress}
                                </p>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">Địa chỉ nhận</Label>
                                <p className="text-sm text-muted-foreground break-all font-mono">
                                  {selectedTransaction.toAddress}
                                </p>
                              </div>

                              {selectedTransaction.user && (
                                <div>
                                  <Label className="text-sm font-medium">Thông tin người dùng</Label>
                                  <div className="bg-muted p-3 rounded-md">
                                    <p className="text-sm">
                                      <strong>Email:</strong> {selectedTransaction.user.email}
                                    </p>
                                    <p className="text-sm">
                                      <strong>Wallet:</strong> {selectedTransaction.user.walletAddress}
                                    </p>
                                    <p className="text-sm">
                                      <strong>User ID:</strong> {selectedTransaction.user.id}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {selectedTransaction.zkProof && (
                                <div>
                                  <Label className="text-sm font-medium">ZK Proof Information</Label>
                                  <div className="bg-muted p-3 rounded-md">
                                    <p className="text-sm">
                                      <strong>Proof ID:</strong> {selectedTransaction.zkProof.id}
                                    </p>
                                    <p className="text-sm">
                                      <strong>Created:</strong>{" "}
                                      {new Date(selectedTransaction.zkProof.createdAt).toLocaleString("vi-VN")}
                                    </p>
                                    <p className="text-sm">
                                      <strong>Hash:</strong> {selectedTransaction.zkProofHash}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 pt-4">
                                {selectedTransaction.status === "pending" && (
                                  <>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Xác minh
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Xác minh giao dịch</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Bạn có chắc chắn muốn xác minh giao dịch này? Hành động này không thể hoàn
                                            tác.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleUpdateTransactionStatus(selectedTransaction.id, "verified")
                                            }
                                          >
                                            Xác minh
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">
                                          <Ban className="w-4 h-4 mr-1" />
                                          Từ chối
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Từ chối giao dịch</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Bạn có chắc chắn muốn từ chối giao dịch này? Giao dịch sẽ được đánh dấu là
                                            thất bại.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleUpdateTransactionStatus(selectedTransaction.id, "failed")
                                            }
                                          >
                                            Từ chối
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {tx.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateTransactionStatus(tx.id, "verified")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Xác minh
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateTransactionStatus(tx.id, "failed")}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              Đầu
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
            <Button variant="outline" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              Cuối
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
