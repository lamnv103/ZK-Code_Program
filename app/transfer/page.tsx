"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PinInput } from "@/components/pin-input"
<<<<<<< HEAD
import { Shield, Send, CheckCircle, Loader2, ArrowLeft, User, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
=======
import { Shield, Send, CheckCircle, Loader2, ArrowLeft, User, AlertCircle, Zap, Lock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
>>>>>>> 063705e (Initial commit)
import Link from "next/link"

interface Recipient {
  id: string
  email: string
  name: string
  walletAddress: string
}

<<<<<<< HEAD
type TransferStep = "input" | "verify" | "pin" | "confirm" | "success"

export default function TransferPage() {
  const [step, setStep] = useState<TransferStep>("input")
=======
interface ZKProof {
  proof: any
  publicSignals: string[]
  balanceCommitment: string
  nullifierHash: string
  newBalanceCommitment: string
}

interface TransferDetails {
  amount: string
  amountWei: string
  recipientAddress: string
  currentBalance: string
  newBalance: string
}

type TransferStep = "recipient" | "amount" | "proof" | "pin" | "confirm" | "success"

export default function TransferPage() {
  const [step, setStep] = useState<TransferStep>("recipient")
>>>>>>> 063705e (Initial commit)
  const [recipientAccount, setRecipientAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [recipient, setRecipient] = useState<Recipient | null>(null)
<<<<<<< HEAD
  const [balanceCheck, setBalanceCheck] = useState<any>(null)
  const [transferPin, setTransferPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transferResult, setTransferResult] = useState<any>(null)
  const { toast } = useToast()
=======
  const [zkProof, setZkProof] = useState<ZKProof | null>(null)
  const [transferDetails, setTransferDetails] = useState<TransferDetails | null>(null)
  const [proofMetadata, setProofMetadata] = useState<any>(null)
  const [transferPin, setTransferPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [transferResult, setTransferResult] = useState<any>(null)
  const [showProofDetails, setShowProofDetails] = useState(false)
  const { toast } = useToast()
  const { user, token, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <p className="text-yellow-800 mb-4">Please login to make transfers</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/auth/login">Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
>>>>>>> 063705e (Initial commit)

  const handleFindRecipient = async () => {
    if (!recipientAccount.trim()) {
      toast({
<<<<<<< HEAD
        title: "Lỗi",
        description: "Vui lòng nhập email hoặc địa chỉ ví người nhận",
=======
        title: "Error",
        description: "Please enter recipient email or wallet address",
>>>>>>> 063705e (Initial commit)
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
<<<<<<< HEAD
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập để thực hiện chuyển tiền",
          variant: "destructive",
        })
        return
      }

=======
>>>>>>> 063705e (Initial commit)
      const response = await fetch("/api/transfer/find-recipient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientAccount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error)
      }

      setRecipient(data.recipient)
<<<<<<< HEAD
      setStep("verify")
      toast({
        title: "Thành công",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tìm thấy người nhận",
=======
      setStep("amount")
      toast({
        title: "Success",
        description: "Recipient found successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to find recipient",
>>>>>>> 063705e (Initial commit)
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

<<<<<<< HEAD
  const handleCheckBalance = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
=======
  const handleGenerateProof = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid transfer amount",
>>>>>>> 063705e (Initial commit)
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
<<<<<<< HEAD
      const token = localStorage.getItem("token")
      const response = await fetch("/api/transfer/check-balance", {
=======
      console.log("🚀 Starting ZK Proof generation...")

      const response = await fetch("/api/transfer/generate-proof", {
>>>>>>> 063705e (Initial commit)
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
<<<<<<< HEAD
        body: JSON.stringify({ amount }),
=======
        body: JSON.stringify({
          transferAmount: amount,
          recipientAddress: recipient?.walletAddress,
        }),
>>>>>>> 063705e (Initial commit)
      })

      const data = await response.json()

      if (!response.ok) {
<<<<<<< HEAD
        throw new Error(data.error)
      }

      setBalanceCheck(data)

      if (data.hasSufficientBalance) {
        setStep("pin")
        toast({
          title: "Kiểm tra thành công",
          description: data.message,
        })
      } else {
        toast({
          title: "Số dư không đủ",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể kiểm tra số dư",
=======
        throw new Error(data.message || data.error)
      }

      setZkProof(data.zkProof)
      setTransferDetails(data.transferDetails)
      setProofMetadata(data.proofMetadata)
      setStep("proof")

      toast({
        title: "ZK Proof Generated",
        description: data.message,
      })

      console.log("✅ ZK Proof generated successfully")
    } catch (error) {
      toast({
        title: "Proof Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate zero-knowledge proof",
>>>>>>> 063705e (Initial commit)
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinComplete = (pin: string) => {
    setTransferPin(pin)
    setStep("confirm")
  }

  const handleExecuteTransfer = async () => {
    setIsLoading(true)
    try {
<<<<<<< HEAD
      const token = localStorage.getItem("token")
      const response = await fetch("/api/transfer/execute", {
=======
      console.log("🔍 Executing transfer with ZK Proof verification...")

      const response = await fetch("/api/transfer/verify-and-execute", {
>>>>>>> 063705e (Initial commit)
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
<<<<<<< HEAD
          recipientId: recipient?.id,
          amount,
=======
          zkProof,
          transferDetails,
          proofMetadata,
          recipientId: recipient?.id,
>>>>>>> 063705e (Initial commit)
          transferPin,
          description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error)
      }

      setTransferResult(data)
      setStep("success")
      toast({
<<<<<<< HEAD
        title: "Chuyển tiền thành công!",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Lỗi chuyển tiền",
        description: error instanceof Error ? error.message : "Không thể thực hiện chuyển tiền",
=======
        title: "Transfer Successful!",
        description: data.message,
      })

      console.log("🎉 Transfer completed successfully!")
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to execute transfer",
>>>>>>> 063705e (Initial commit)
        variant: "destructive",
      })
      setStep("pin") // Go back to PIN step
    } finally {
      setIsLoading(false)
    }
  }

  const resetTransfer = () => {
<<<<<<< HEAD
    setStep("input")
=======
    setStep("recipient")
>>>>>>> 063705e (Initial commit)
    setRecipientAccount("")
    setAmount("")
    setDescription("")
    setRecipient(null)
<<<<<<< HEAD
    setBalanceCheck(null)
    setTransferPin("")
    setTransferResult(null)
=======
    setZkProof(null)
    setTransferDetails(null)
    setProofMetadata(null)
    setTransferPin("")
    setTransferResult(null)
    setShowProofDetails(false)
>>>>>>> 063705e (Initial commit)
  }

  // Success Step
  if (step === "success") {
    return (
      <div className="container mx-auto px-4 py-8">
<<<<<<< HEAD
        <div className="max-w-md mx-auto">
=======
        <div className="max-w-2xl mx-auto">
>>>>>>> 063705e (Initial commit)
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
<<<<<<< HEAD
              <CardTitle className="text-green-800">Chuyển tiền thành công!</CardTitle>
              <CardDescription>Giao dịch đã được thực hiện thành công</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Người nhận:</span>
                  <span className="font-semibold">{transferResult?.transfer.recipient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-sm">{transferResult?.transfer.recipient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-semibold text-lg">{transferResult?.transfer.amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Số dư còn lại:</span>
                  <span className="font-semibold">{transferResult?.newBalance} ETH</span>
                </div>
              </div>
              <Button onClick={resetTransfer} className="w-full bg-transparent" variant="outline">
                Thực hiện giao dịch khác
              </Button>
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/">Về trang chủ</Link>
              </Button>
=======
              <CardTitle className="text-green-800">Transfer Successful!</CardTitle>
              <CardDescription>Zero-knowledge proof verified and transfer completed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transfer Details */}
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">Transfer Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Recipient:</span>
                    <p className="font-semibold">{transferResult?.transfer.recipient.name}</p>
                    <p className="text-xs text-muted-foreground">{transferResult?.transfer.recipient.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-semibold text-2xl text-green-600">{transferResult?.transfer.amount} ETH</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Previous Balance:</span>
                    <p className="font-medium">{transferResult?.balanceUpdate.previousBalance} ETH</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">New Balance:</span>
                    <p className="font-medium">{transferResult?.balanceUpdate.newBalance} ETH</p>
                  </div>
                </div>
              </div>

              {/* ZK Proof Verification */}
              <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Zero-Knowledge Proof Verification
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Verification Status:</span>
                    <p className="font-semibold text-green-600">✅ Verified</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verification Time:</span>
                    <p className="font-medium">{transferResult?.zkProofVerification.verificationTime}ms</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Proof ID:</span>
                    <p className="font-mono text-xs">{transferResult?.zkProofVerification.proofId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Balance Commitment:</span>
                    <p className="font-mono text-xs">
                      {transferResult?.zkProofVerification.balanceCommitment.substring(0, 16)}...
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={resetTransfer} variant="outline" className="flex-1 bg-transparent">
                  Make Another Transfer
                </Button>
                <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                  <Link href="/history">View History</Link>
                </Button>
              </div>
>>>>>>> 063705e (Initial commit)
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
<<<<<<< HEAD
          <h1 className="text-3xl font-bold mb-2">Chuyển tiền</h1>
          <p className="text-muted-foreground">Chuyển tiền an toàn với Zero-Knowledge Proof</p>
        </div>

        {/* Step 1: Input recipient and amount */}
        {step === "input" && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chuyển tiền</CardTitle>
              <CardDescription>Nhập thông tin người nhận và số tiền cần chuyển</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Email hoặc địa chỉ ví người nhận</Label>
                <Input
                  id="recipient"
                  placeholder="user@example.com hoặc 0x..."
=======
          <h1 className="text-3xl font-bold mb-2">Secure Money Transfer</h1>
          <p className="text-muted-foreground">Transfer money with zero-knowledge proof privacy</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {["recipient", "amount", "proof", "pin", "confirm"].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName
                    ? "bg-blue-600 text-white"
                    : ["recipient", "amount", "proof", "pin", "confirm"].indexOf(step) > index
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Step 1: Find Recipient */}
        {step === "recipient" && (
          <Card>
            <CardHeader>
              <CardTitle>Find Recipient</CardTitle>
              <CardDescription>Enter recipient's email or wallet address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Email or Wallet Address</Label>
                <Input
                  id="recipient"
                  placeholder="user@example.com or 0x..."
>>>>>>> 063705e (Initial commit)
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleFindRecipient} className="w-full" disabled={isLoading || !recipientAccount.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
<<<<<<< HEAD
                    Đang tìm kiếm...
=======
                    Searching...
>>>>>>> 063705e (Initial commit)
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
<<<<<<< HEAD
                    Tìm người nhận
=======
                    Find Recipient
>>>>>>> 063705e (Initial commit)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

<<<<<<< HEAD
        {/* Step 2: Verify recipient and enter amount */}
        {step === "verify" && recipient && (
          <Card>
            <CardHeader>
              <CardTitle>Xác nhận người nhận</CardTitle>
              <CardDescription>Kiểm tra thông tin người nhận và nhập số tiền</CardDescription>
=======
        {/* Step 2: Enter Amount */}
        {step === "amount" && recipient && (
          <Card>
            <CardHeader>
              <CardTitle>Transfer Amount</CardTitle>
              <CardDescription>Enter the amount to transfer</CardDescription>
>>>>>>> 063705e (Initial commit)
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{recipient.name}</p>
                    <p className="text-sm text-muted-foreground">{recipient.email}</p>
<<<<<<< HEAD
                    <p className="text-xs text-muted-foreground">{recipient.walletAddress}</p>
=======
                    <p className="text-xs text-muted-foreground font-mono">{recipient.walletAddress}</p>
>>>>>>> 063705e (Initial commit)
                  </div>
                </div>
              </div>

              <div className="space-y-2">
<<<<<<< HEAD
                <Label htmlFor="amount">Số tiền (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
=======
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
>>>>>>> 063705e (Initial commit)
                  placeholder="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
<<<<<<< HEAD
                <Label htmlFor="description">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="description"
                  placeholder="Nội dung chuyển tiền..."
=======
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Payment for..."
>>>>>>> 063705e (Initial commit)
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-2">
<<<<<<< HEAD
                <Button onClick={() => setStep("input")} variant="outline" className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button
                  onClick={handleCheckBalance}
                  className="flex-1"
=======
                <Button onClick={() => setStep("recipient")} variant="outline" className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleGenerateProof}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
>>>>>>> 063705e (Initial commit)
                  disabled={isLoading || !amount || Number.parseFloat(amount) <= 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
<<<<<<< HEAD
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Kiểm tra số dư
=======
                      Generating Proof...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate ZK Proof
>>>>>>> 063705e (Initial commit)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

<<<<<<< HEAD
        {/* Step 3: Enter PIN */}
        {step === "pin" && (
          <Card>
            <CardHeader>
              <CardTitle>Nhập mã PIN chuyển tiền</CardTitle>
              <CardDescription>Nhập mã PIN 6 số để xác thực giao dịch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {balanceCheck && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Số dư đủ để thực hiện giao dịch</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">Số dư hiện tại: {balanceCheck.currentBalance} ETH</p>
                </div>
              )}

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Nhập mã PIN chuyển tiền (6 chữ số)</p>
                <PinInput length={6} onComplete={handlePinComplete} disabled={isLoading} />
              </div>

              <Button onClick={() => setStep("verify")} variant="outline" className="w-full" disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
=======
        {/* Step 3: ZK Proof Generated */}
        {step === "proof" && zkProof && transferDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Zero-Knowledge Proof Generated
              </CardTitle>
              <CardDescription>Balance sufficiency proven without revealing your actual balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Proof Generation Successful</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Transfer Amount:</span>
                    <p className="font-semibold text-lg">{transferDetails.amount} ETH</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Balance:</span>
                    <p className="font-medium">{transferDetails.currentBalance} ETH</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Balance After Transfer:</span>
                    <p className="font-medium">{transferDetails.newBalance} ETH</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Proof Status:</span>
                    <p className="font-medium text-green-600">✅ Valid</p>
                  </div>
                </div>
              </div>

              {/* ZK Proof Details */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Zero-Knowledge Proof Details</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowProofDetails(!showProofDetails)}>
                    {showProofDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {showProofDetails && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Balance Commitment:</span>
                      <p className="font-mono break-all">{zkProof.balanceCommitment}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nullifier Hash:</span>
                      <p className="font-mono break-all">{zkProof.nullifierHash}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">New Balance Commitment:</span>
                      <p className="font-mono break-all">{zkProof.newBalanceCommitment}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep("amount")} variant="outline" className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep("pin")} className="flex-1 bg-gradient-to-r from-green-600 to-blue-600">
                  <Lock className="w-4 h-4 mr-2" />
                  Continue to PIN
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Enter PIN */}
        {step === "pin" && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Transfer PIN</CardTitle>
              <CardDescription>Enter your 6-digit PIN to authorize the transfer (Demo: 123456)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Enter your transfer PIN (6 digits)</p>
                <PinInput length={6} onComplete={handlePinComplete} disabled={isLoading} />
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                )}
              </div>

              <Button onClick={() => setStep("proof")} variant="outline" className="w-full" disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
>>>>>>> 063705e (Initial commit)
              </Button>
            </CardContent>
          </Card>
        )}

<<<<<<< HEAD
        {/* Step 4: Confirm transfer */}
        {step === "confirm" && (
          <Card>
            <CardHeader>
              <CardTitle>Xác nhận chuyển tiền</CardTitle>
              <CardDescription>Kiểm tra lại thông tin trước khi thực hiện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Xác nhận giao dịch</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Người nhận:</span>
                    <span className="font-semibold">{recipient?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{recipient?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số tiền:</span>
                    <span className="font-semibold text-lg">{amount} ETH</span>
                  </div>
                  {description && (
                    <div className="flex justify-between">
                      <span>Ghi chú:</span>
                      <span>{description}</span>
                    </div>
                  )}
=======
        {/* Step 5: Confirm Transfer */}
        {step === "confirm" && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Transfer</CardTitle>
              <CardDescription>Review all details before executing the transfer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 mb-3">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Final Confirmation</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Recipient:</span>
                      <p className="font-semibold">{recipient?.name}</p>
                      <p className="text-xs text-muted-foreground">{recipient?.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <p className="font-semibold text-2xl text-red-600">{amount} ETH</p>
                    </div>
                  </div>
                  {description && (
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="font-medium">{description}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-green-700">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Zero-Knowledge Proof: ✅ Verified</span>
                    </div>
                  </div>
>>>>>>> 063705e (Initial commit)
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep("pin")} variant="outline" className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
<<<<<<< HEAD
                  Quay lại
                </Button>
                <Button
                  onClick={handleExecuteTransfer}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
=======
                  Back
                </Button>
                <Button
                  onClick={handleExecuteTransfer}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600"
>>>>>>> 063705e (Initial commit)
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
<<<<<<< HEAD
                      Đang chuyển...
=======
                      Executing Transfer...
>>>>>>> 063705e (Initial commit)
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
<<<<<<< HEAD
                      Xác nhận chuyển tiền
=======
                      Execute Transfer
>>>>>>> 063705e (Initial commit)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

<<<<<<< HEAD
        {/* ZKP Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Về Zero-Knowledge Proof</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>• Số dư của bạn được mã hóa và bảo mật tuyệt đối</p>
              <p>• Hệ thống chỉ xác minh bạn có đủ số dư mà không biết số tiền cụ thể</p>
              <p>• Giao dịch được thực hiện an toàn với mã PIN bảo vệ</p>
=======
        {/* Privacy Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Zero-Knowledge Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-700 text-sm">
              <p>• Your balance is encrypted and never revealed during the transfer process</p>
              <p>• ZK Proof mathematically proves you have sufficient funds without showing the amount</p>
              <p>• Only transfer amount and recipient address are publicly visible</p>
              <p>• Complete privacy protection with cryptographic guarantees</p>
>>>>>>> 063705e (Initial commit)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
