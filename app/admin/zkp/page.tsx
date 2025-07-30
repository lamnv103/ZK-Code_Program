"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Shield,
  Settings,
  Activity,
  CheckCircle,
  RefreshCw,
  Eye,
  Play,
  AlertTriangle,
  Clock,
  Zap,
  Server,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ZkProof {
  id: string
  transactionId: string
  proofData: any
  publicSignals: any
  createdAt: string
  verificationTime?: number
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
  proofsByDay: Array<{ date: string; count: number }>
}

interface SystemStatus {
  proverService: "online" | "offline" | "maintenance"
  verifierService: "online" | "offline" | "maintenance"
  circuitCompiler: "online" | "offline" | "maintenance"
  keyGenerator: "online" | "offline" | "maintenance"
}

interface ZkpConfig {
  proofType: string
  circuitSize: string
  verificationKey: string
  maxProofSize: number
  timeoutMs: number
}

export default function ZKPManagement() {
  const [zkProofs, setZkProofs] = useState<ZkProof[]>([])
  const [stats, setStats] = useState<ZkpStats | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    proverService: "online",
    verifierService: "online",
    circuitCompiler: "online",
    keyGenerator: "maintenance",
  })
  const [zkpConfig, setZkpConfig] = useState<ZkpConfig>({
    proofType: "zk-SNARK",
    circuitSize: "2^20",
    verificationKey: "vk_abc123...",
    maxProofSize: 1024,
    timeoutMs: 30000,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedProof, setSelectedProof] = useState<ZkProof | null>(null)
  const [testProofData, setTestProofData] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [isTestingProof, setIsTestingProof] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [zkProofsRes, statsRes] = await Promise.all([fetch("/api/admin/zkproofs"), fetch("/api/admin/zkp/stats")])

      if (!zkProofsRes.ok || !statsRes.ok) {
        throw new Error("Không thể tải dữ liệu")
      }

      const [zkProofsData, statsData] = await Promise.all([zkProofsRes.json(), statsRes.json()])

      setZkProofs(zkProofsData.zkProofs || [])
      setStats(
        statsData.stats || {
          totalProofs: zkProofsData.zkProofs?.length || 0,
          successRate: 99.7,
          avgVerificationTime: 2.3,
          activeVerifiers: 5,
          proofsByDay: [],
        },
      )
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

  const handleTestProof = async () => {
    if (!testProofData.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập dữ liệu proof để test",
        variant: "destructive",
      })
      return
    }

    setIsTestingProof(true)
    try {
      const response = await fetch("/api/admin/zkp/test-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proofData: testProofData,
          testType: "manual",
        }),
      })

      const data = await response.json()
      setTestResult(data)

      if (data.success) {
        toast({
          title: "Test thành công",
          description: `Proof được xác minh trong ${data.verificationTime}ms`,
        })
      } else {
        toast({
          title: "Test thất bại",
          description: data.error || "Proof không hợp lệ",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi test",
        description: "Không thể thực hiện test verification",
        variant: "destructive",
      })
    } finally {
      setIsTestingProof(false)
    }
  }

  const handleUpdateConfig = async () => {
    try {
      const response = await fetch("/api/admin/zkp/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(zkpConfig),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Cập nhật thành công",
          description: "Cấu hình ZKP đã được cập nhật",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật cấu hình",
        variant: "destructive",
      })
    }
  }

  const handleRestartService = async (serviceName: string) => {
    try {
      const response = await fetch("/api/admin/zkp/restart-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ service: serviceName }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Khởi động lại thành công",
          description: `${serviceName} đã được khởi động lại`,
        })
        // Update system status
        setSystemStatus((prev) => ({
          ...prev,
          [serviceName]: "online",
        }))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Lỗi khởi động lại",
        description: `Không thể khởi động lại ${serviceName}`,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">✅ Hoàn thành</Badge>
      case "verifying":
        return <Badge className="bg-blue-100 text-blue-800">🔄 Đang xác minh</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Chờ xử lý</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">❌ Thất bại</Badge>
      default:
        return null
    }
  }

  const getServiceStatusBadge = (status: "online" | "offline" | "maintenance") => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-100 text-green-800">🟢 Online</Badge>
      case "offline":
        return <Badge className="bg-red-100 text-red-800">🔴 Offline</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">🟡 Maintenance</Badge>
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
                <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 50)} hôm nay</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
                <p className="text-xs text-muted-foreground">+0.2% so với tuần trước</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thời gian xác minh TB</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgVerificationTime}s</div>
                <p className="text-xs text-muted-foreground">-0.1s so với tuần trước</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verifiers hoạt động</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeVerifiers}</div>
                <p className="text-xs text-muted-foreground">Tất cả đang hoạt động</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* ZKP Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình ZKP</CardTitle>
              <CardDescription>Thiết lập tham số cho hệ thống Zero-Knowledge Proof</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proof-type">Loại ZK Proof</Label>
                <Input
                  id="proof-type"
                  value={zkpConfig.proofType}
                  onChange={(e) => setZkpConfig((prev) => ({ ...prev, proofType: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="circuit-size">Kích thước Circuit</Label>
                <Input
                  id="circuit-size"
                  value={zkpConfig.circuitSize}
                  onChange={(e) => setZkpConfig((prev) => ({ ...prev, circuitSize: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-proof-size">Kích thước Proof tối đa (KB)</Label>
                <Input
                  id="max-proof-size"
                  type="number"
                  value={zkpConfig.maxProofSize}
                  onChange={(e) => setZkpConfig((prev) => ({ ...prev, maxProofSize: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={zkpConfig.timeoutMs}
                  onChange={(e) => setZkpConfig((prev) => ({ ...prev, timeoutMs: Number.parseInt(e.target.value) }))}
                />
              </div>
              <Button onClick={handleUpdateConfig} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Cập nhật cấu hình
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái hệ thống</CardTitle>
              <CardDescription>Giám sát tình trạng các thành phần ZKP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Prover Service</span>
                <div className="flex items-center gap-2">
                  {getServiceStatusBadge(systemStatus.proverService)}
                  {systemStatus.proverService !== "online" && (
                    <Button size="sm" variant="outline" onClick={() => handleRestartService("proverService")}>
                      Restart
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Verifier Service</span>
                <div className="flex items-center gap-2">
                  {getServiceStatusBadge(systemStatus.verifierService)}
                  {systemStatus.verifierService !== "online" && (
                    <Button size="sm" variant="outline" onClick={() => handleRestartService("verifierService")}>
                      Restart
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Circuit Compiler</span>
                <div className="flex items-center gap-2">
                  {getServiceStatusBadge(systemStatus.circuitCompiler)}
                  {systemStatus.circuitCompiler !== "online" && (
                    <Button size="sm" variant="outline" onClick={() => handleRestartService("circuitCompiler")}>
                      Restart
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Key Generator</span>
                <div className="flex items-center gap-2">
                  {getServiceStatusBadge(systemStatus.keyGenerator)}
                  {systemStatus.keyGenerator !== "online" && (
                    <Button size="sm" variant="outline" onClick={() => handleRestartService("keyGenerator")}>
                      Restart
                    </Button>
                  )}
                </div>
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

        {/* Test Verification */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test ZK Proof Verification</CardTitle>
            <CardDescription>Kiểm tra tính năng xác minh proof với dữ liệu test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-proof">Dữ liệu Proof (JSON)</Label>
              <Textarea
                id="test-proof"
                placeholder='{"proof": {...}, "publicSignals": [...], "amount": "1.5"}'
                value={testProofData}
                onChange={(e) => setTestProofData(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTestProof} disabled={isTestingProof}>
                {isTestingProof ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Test Verification
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setTestProofData(
                    '{"proof":{"pi_a":["0x123..."],"pi_b":[["0x456..."]],"pi_c":["0x789..."]},"publicSignals":["1500","0x987..."],"amount":"1.5"}',
                  )
                }
              >
                Dùng dữ liệu mẫu
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-lg border ${testResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${testResult.success ? "text-green-800" : "text-red-800"}`}>
                    {testResult.success ? "Verification thành công" : "Verification thất bại"}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  {testResult.verificationTime && <p>Thời gian xác minh: {testResult.verificationTime}ms</p>}
                  {testResult.error && <p className="text-red-700">Lỗi: {testResult.error}</p>}
                  {testResult.details && (
                    <pre className="bg-white p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
                        <span className="font-medium">Proof #{proof.id.substring(0, 8)}</span>
                        {getStatusBadge(proof.transaction.status)}
                        {proof.verificationTime && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {proof.verificationTime}ms
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Transaction ID:{" "}
                        <code className="bg-muted px-1 py-0.5 rounded">{proof.transactionId.substring(0, 10)}...</code>
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
                    <div className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedProof(proof)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Chi tiết ZK Proof #{proof.id.substring(0, 8)}</DialogTitle>
                            <DialogDescription>Thông tin chi tiết về proof và transaction liên quan</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Proof ID</Label>
                                <p className="text-sm text-muted-foreground">{proof.id}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Transaction ID</Label>
                                <p className="text-sm text-muted-foreground">{proof.transactionId}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Amount</Label>
                                <p className="text-sm font-medium">{proof.transaction.amount} ETH</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Status</Label>
                                {getStatusBadge(proof.transaction.status)}
                              </div>
                              <div>
                                <Label className="text-sm font-medium">From Address</Label>
                                <p className="text-xs text-muted-foreground break-all">
                                  {proof.transaction.fromAddress}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">To Address</Label>
                                <p className="text-xs text-muted-foreground break-all">{proof.transaction.toAddress}</p>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Proof Data</Label>
                              <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                                {JSON.stringify(proof.proofData, null, 2)}
                              </pre>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Public Signals</Label>
                              <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                                {JSON.stringify(proof.publicSignals, null, 2)}
                              </pre>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setTestProofData(
                                    JSON.stringify(
                                      {
                                        proof: proof.proofData,
                                        publicSignals: proof.publicSignals,
                                        amount: proof.transaction.amount,
                                      },
                                      null,
                                      2,
                                    ),
                                  )
                                }}
                              >
                                <Zap className="w-4 h-4 mr-1" />
                                Test lại proof này
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>CPU Usage</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>

                <div className="flex justify-between">
                  <span>Memory Usage</span>
                  <span className="font-medium">62%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "62%" }}></div>
                </div>

                <div className="flex justify-between">
                  <span>Disk Usage</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "28%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo thời gian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Proofs hôm nay</span>
                  <span className="font-medium">{Math.floor(Math.random() * 100) + 50}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proofs tuần này</span>
                  <span className="font-medium">{Math.floor(Math.random() * 500) + 300}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proofs tháng này</span>
                  <span className="font-medium">{Math.floor(Math.random() * 2000) + 1500}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian xác minh nhanh nhất</span>
                  <span className="font-medium text-green-600">0.8s</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian xác minh chậm nhất</span>
                  <span className="font-medium text-red-600">15.2s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
