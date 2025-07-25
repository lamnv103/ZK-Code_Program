"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Settings, Activity, CheckCircle, RefreshCw } from "lucide-react"

interface ZkProof {
  id: string
  transactionId: string
  proofData: any
  publicSignals: any
  createdAt: string
  transaction: {
    id: string
    fromAddress: string
    toAddress: string
    amount: string
    status: string
    userId: string
  }
}

interface ZkpStats {
  totalProofs: number
  successRate: number
  avgVerificationTime: number
  activeVerifiers: number
}

export default function ZKPManagement() {
  const [zkProofs, setZkProofs] = useState<ZkProof[]>([])
  const [stats, setStats] = useState<ZkpStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [zkProofsRes, statsRes] = await Promise.all([fetch("/api/admin/zkproofs"), fetch("/api/admin/stats")])

      if (!zkProofsRes.ok || !statsRes.ok) {
        throw new Error("Không thể tải dữ liệu")
      }

      const [zkProofsData, statsData] = await Promise.all([zkProofsRes.json(), statsRes.json()])

      setZkProofs(zkProofsData.zkProofs || [])
      setStats({
        totalProofs: statsData.stats.totalZkProofs,
        successRate: statsData.stats.successRate,
        avgVerificationTime: 2.3, // This would come from actual calculation
        activeVerifiers: 5, // This would come from system monitoring
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">✅ Hoàn thành</Badge>
      case "verifying":
        return <Badge className="bg-blue-100 text-blue-800">🔄 Đang xác minh</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Chờ xử lý</Badge>
      default:
        return null
    }
  }

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
          <h1 className="text-3xl font-bold mb-2">Quản lý Zero-Knowledge Proof</h1>
          <p className="text-muted-foreground">Giám sát và cấu hình hệ thống ZKP verification</p>
        </div>

        {/* ZKP Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng ZK Proofs</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProofs.toLocaleString()}</div>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thời gian xác minh TB</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgVerificationTime}s</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verifiers hoạt động</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeVerifiers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ZKP Configuration */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình ZKP</CardTitle>
              <CardDescription>Thiết lập tham số cho hệ thống Zero-Knowledge Proof</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proof-type">Loại ZK Proof</Label>
                <Input id="proof-type" value="zk-SNARK" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="circuit-size">Kích thước Circuit</Label>
                <Input id="circuit-size" value="2^20" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verification-key">Verification Key</Label>
                <Input id="verification-key" value="vk_abc123..." readOnly />
              </div>
              <Button className="w-full bg-transparent" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Cập nhật cấu hình
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trạng thái hệ thống</CardTitle>
              <CardDescription>Giám sát tình trạng các thành phần ZKP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Prover Service</span>
                <Badge className="bg-green-100 text-green-800">🟢 Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Verifier Service</span>
                <Badge className="bg-green-100 text-green-800">🟢 Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Circuit Compiler</span>
                <Badge className="bg-green-100 text-green-800">🟢 Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Key Generator</span>
                <Badge className="bg-yellow-100 text-yellow-800">🟡 Maintenance</Badge>
              </div>
              <Button className="w-full" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Làm mới trạng thái
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ZKP Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách ZK Proof</CardTitle>
            <CardDescription>Các proof đã được xử lý trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            {zkProofs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chưa có ZK Proof nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {zkProofs.map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Proof #{proof.id}</span>
                        {getStatusBadge(proof.transaction.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Transaction ID: <code className="bg-muted px-1 py-0.5 rounded">{proof.transactionId}</code>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Amount: <span className="font-medium">{proof.transaction.amount} ETH</span> | From:{" "}
                        <code className="bg-muted px-1 py-0.5 rounded">
                          {proof.transaction.fromAddress.substring(0, 10)}...
                        </code>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created At: {new Date(proof.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Button size="sm" variant="ghost">
                        Chi tiết
                      </Button>
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
