"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
<<<<<<< HEAD
import { Shield, Settings, Activity, CheckCircle, RefreshCw } from "lucide-react"
=======
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Settings,
  Activity,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Zap,
  Database,
  Server,
  Eye,
  Download,
  Upload,
  Play,
  Pause,
} from "lucide-react"
>>>>>>> 063705e (Initial commit)

interface ZkProof {
  id: string
  transactionId: string
  proofData: any
  publicSignals: any
<<<<<<< HEAD
=======
  verificationTime: number
>>>>>>> 063705e (Initial commit)
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
<<<<<<< HEAD
=======
  circuitSize: string
  proofSystem: string
  dailyProofs: number
  weeklyProofs: number
}

interface SystemStatus {
  proverService: "online" | "offline" | "maintenance"
  verifierService: "online" | "offline" | "maintenance"
  circuitCompiler: "online" | "offline" | "maintenance"
  keyGenerator: "online" | "offline" | "maintenance"
  database: "online" | "offline" | "maintenance"
>>>>>>> 063705e (Initial commit)
}

export default function ZKPManagement() {
  const [zkProofs, setZkProofs] = useState<ZkProof[]>([])
  const [stats, setStats] = useState<ZkpStats | null>(null)
<<<<<<< HEAD
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
=======
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedProof, setSelectedProof] = useState<ZkProof | null>(null)
  const [circuitConfig, setCircuitConfig] = useState({
    proofType: "zk-SNARK",
    circuitSize: "2^20",
    verificationKey: "vk_abc123...",
    trustedSetup: "ceremony_final.ptau",
  })

  useEffect(() => {
    fetchData()
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
>>>>>>> 063705e (Initial commit)
  }, [])

  const fetchData = async () => {
    try {
<<<<<<< HEAD
      const [zkProofsRes, statsRes] = await Promise.all([fetch("/api/admin/zkproofs"), fetch("/api/admin/stats")])
=======
      const [zkProofsRes, statsRes] = await Promise.all([fetch("/api/admin/zkproofs"), fetch("/api/admin/zkp/stats")])
>>>>>>> 063705e (Initial commit)

      if (!zkProofsRes.ok || !statsRes.ok) {
        throw new Error("Không thể tải dữ liệu")
      }

      const [zkProofsData, statsData] = await Promise.all([zkProofsRes.json(), statsRes.json()])

      setZkProofs(zkProofsData.zkProofs || [])
<<<<<<< HEAD
      setStats({
        totalProofs: statsData.stats.totalZkProofs,
        successRate: statsData.stats.successRate,
        avgVerificationTime: 2.3, // This would come from actual calculation
        activeVerifiers: 5, // This would come from system monitoring
=======
      setStats(
        statsData.stats || {
          totalProofs: zkProofsData.zkProofs?.length || 0,
          successRate: 99.7,
          avgVerificationTime: 2.3,
          activeVerifiers: 5,
          circuitSize: "2^20",
          proofSystem: "Groth16",
          dailyProofs: 45,
          weeklyProofs: 312,
        },
      )
      setSystemStatus({
        proverService: "online",
        verifierService: "online",
        circuitCompiler: "online",
        keyGenerator: "maintenance",
        database: "online",
>>>>>>> 063705e (Initial commit)
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

<<<<<<< HEAD
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

=======
  const handleVerifyProof = async (proofId: string) => {
    try {
      const response = await fetch("/api/admin/zkp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofId }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchData() // Refresh data
      }
    } catch (error) {
      console.error("Verification error:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800">🟢 Online</Badge>
      case "offline":
        return <Badge className="bg-red-100 text-red-800">🔴 Offline</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">🟡 Maintenance</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">❓ Unknown</Badge>
    }
  }

  const exportProofData = () => {
    const data = {
      stats,
      systemStatus,
      proofs: zkProofs.map((proof) => ({
        id: proof.id,
        transactionId: proof.transactionId,
        verificationTime: proof.verificationTime,
        createdAt: proof.createdAt,
        status: proof.transaction.status,
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `zkp_report_${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

>>>>>>> 063705e (Initial commit)
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
<<<<<<< HEAD
            <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
=======
            <p className="mt-4 text-muted-foreground">Đang tải dữ liệu ZKP...</p>
>>>>>>> 063705e (Initial commit)
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
<<<<<<< HEAD
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quản lý Zero-Knowledge Proof</h1>
          <p className="text-muted-foreground">Giám sát và cấu hình hệ thống ZKP verification</p>
=======
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý Zero-Knowledge Proof</h1>
            <p className="text-muted-foreground">Giám sát và cấu hình hệ thống ZKP verification</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportProofData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Làm mới
            </Button>
          </div>
>>>>>>> 063705e (Initial commit)
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
<<<<<<< HEAD
=======
                <p className="text-xs text-muted-foreground">Hôm nay: +{stats.dailyProofs}</p>
>>>>>>> 063705e (Initial commit)
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
<<<<<<< HEAD
=======
                <p className="text-xs text-muted-foreground">Tuần này: {stats.weeklyProofs} proofs</p>
>>>>>>> 063705e (Initial commit)
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thời gian xác minh TB</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgVerificationTime}s</div>
<<<<<<< HEAD
=======
                <p className="text-xs text-muted-foreground">Circuit: {stats.circuitSize}</p>
>>>>>>> 063705e (Initial commit)
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verifiers hoạt động</CardTitle>
<<<<<<< HEAD
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeVerifiers}</div>
=======
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeVerifiers}</div>
                <p className="text-xs text-muted-foreground">{stats.proofSystem} system</p>
>>>>>>> 063705e (Initial commit)
              </CardContent>
            </Card>
          </div>
        )}

<<<<<<< HEAD
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
=======
        {/* System Status & Configuration */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
>>>>>>> 063705e (Initial commit)
              <CardTitle>Trạng thái hệ thống</CardTitle>
              <CardDescription>Giám sát tình trạng các thành phần ZKP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
<<<<<<< HEAD
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
=======
              {systemStatus &&
                Object.entries(systemStatus).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <span className="capitalize">{service.replace(/([A-Z])/g, " $1")}</span>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                ))}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Start All
                  </Button>
                  <Button size="sm" variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Stop All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cấu hình Circuit</CardTitle>
              <CardDescription>Thiết lập tham số cho hệ thống ZKP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proof-type">Loại ZK Proof</Label>
                <Input
                  id="proof-type"
                  value={circuitConfig.proofType}
                  onChange={(e) => setCircuitConfig({ ...circuitConfig, proofType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="circuit-size">Kích thước Circuit</Label>
                <Input
                  id="circuit-size"
                  value={circuitConfig.circuitSize}
                  onChange={(e) => setCircuitConfig({ ...circuitConfig, circuitSize: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verification-key">Verification Key</Label>
                <Input
                  id="verification-key"
                  value={circuitConfig.verificationKey}
                  onChange={(e) => setCircuitConfig({ ...circuitConfig, verificationKey: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Key
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Cập nhật
                </Button>
              </div>
>>>>>>> 063705e (Initial commit)
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
        {/* ZKP Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách ZK Proof</CardTitle>
=======
        {/* Circuit Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hiệu suất Circuit</CardTitle>
            <CardDescription>Thống kê hiệu suất xác minh ZK Proof</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Proof Generation</span>
                  <span className="text-sm font-medium">~1.2s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Proof Verification</span>
                  <span className="text-sm font-medium">~0.3s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Circuit Compilation</span>
                  <span className="text-sm font-medium">~45s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "70%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ZKP Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách ZK Proof gần đây</CardTitle>
>>>>>>> 063705e (Initial commit)
            <CardDescription>Các proof đã được xử lý trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            {zkProofs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chưa có ZK Proof nào</p>
              </div>
            ) : (
              <div className="space-y-4">
<<<<<<< HEAD
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
=======
                {zkProofs.slice(0, 10).map((proof) => (
                  <div
                    key={proof.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Proof #{proof.id.substring(0, 8)}</span>
                        <Badge
                          className={`${
                            proof.transaction.status === "verified"
                              ? "bg-green-100 text-green-800"
                              : proof.transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {proof.transaction.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Transaction:{" "}
                        <code className="bg-muted px-1 py-0.5 rounded">{proof.transactionId.substring(0, 8)}...</code>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Amount: <span className="font-medium">{proof.transaction.amount} ETH</span> | Verification:{" "}
                        <span className="font-medium">{proof.verificationTime || 2.3}s</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{new Date(proof.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedProof(proof)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Chi tiết
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleVerifyProof(proof.id)}>
                        <Zap className="w-4 h-4 mr-2" />
                        Verify
                      </Button>
>>>>>>> 063705e (Initial commit)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
<<<<<<< HEAD
=======

        {/* Proof Detail Modal */}
        {selectedProof && (
          <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Chi tiết ZK Proof</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedProof(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Proof ID:</span>
                    <p className="text-muted-foreground">{selectedProof.id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Transaction ID:</span>
                    <p className="text-muted-foreground">{selectedProof.transactionId}</p>
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span>
                    <p className="text-muted-foreground">{selectedProof.transaction.amount} ETH</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className="text-muted-foreground">{selectedProof.transaction.status}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Public Signals:</span>
                  <Textarea
                    value={JSON.stringify(selectedProof.publicSignals, null, 2)}
                    readOnly
                    className="mt-2 h-32"
                  />
                </div>
                <div>
                  <span className="font-medium">Proof Data:</span>
                  <Textarea value={JSON.stringify(selectedProof.proofData, null, 2)} readOnly className="mt-2 h-32" />
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Security Alerts */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Cảnh báo bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-yellow-700 text-sm">
              <p>• Key Generator đang trong chế độ maintenance - một số chức năng có thể bị hạn chế</p>
              <p>• Trusted setup ceremony cần được cập nhật trong 30 ngày tới</p>
              <p>• Backup verification keys được khuyến nghị thực hiện hàng tuần</p>
            </div>
          </CardContent>
        </Card>
>>>>>>> 063705e (Initial commit)
      </div>
    </div>
  )
}
