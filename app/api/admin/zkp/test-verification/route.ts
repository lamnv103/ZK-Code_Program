import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { proofData, testType } = await request.json()

    // Simulate verification process
    const startTime = Date.now()

    // Parse proof data
    let parsedProof
    try {
      parsedProof = typeof proofData === "string" ? JSON.parse(proofData) : proofData
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format",
          message: "Dữ liệu proof không đúng định dạng JSON",
        },
        { status: 400 },
      )
    }

    // Validate proof structure
    if (!parsedProof.proof || !parsedProof.publicSignals) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Proof phải có trường 'proof' và 'publicSignals'",
        },
        { status: 400 },
      )
    }

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 2000))

    const verificationTime = Date.now() - startTime

    // Simulate verification result (90% success rate for demo)
    const isValid = Math.random() > 0.1

    if (isValid) {
      return NextResponse.json({
        success: true,
        verificationTime,
        message: "Proof verification successful",
        details: {
          proofType: "zk-SNARK",
          circuitName: "BalanceCheck",
          publicInputs: parsedProof.publicSignals?.length || 0,
          proofSize: JSON.stringify(parsedProof.proof).length,
          testType,
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        verificationTime,
        error: "Invalid proof",
        message: "Proof verification failed",
        details: {
          reason: "Proof does not satisfy circuit constraints",
          testType,
        },
      })
    }
  } catch (error) {
    console.error("Test verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Lỗi hệ thống khi test verification",
      },
      { status: 500 },
    )
  }
}
