import { NextResponse } from "next/server"

// In production, this would be stored in database or config file
let zkpConfig = {
  proofType: "zk-SNARK",
  circuitSize: "2^20",
  verificationKey: "vk_abc123...",
  maxProofSize: 1024,
  timeoutMs: 30000,
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: zkpConfig,
    })
  } catch (error) {
    console.error("Get ZKP config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const newConfig = await request.json()

    // Validate configuration
    if (!newConfig.proofType || !newConfig.circuitSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required configuration fields",
        },
        { status: 400 },
      )
    }

    if (newConfig.maxProofSize < 100 || newConfig.maxProofSize > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: "maxProofSize must be between 100 and 10000 KB",
        },
        { status: 400 },
      )
    }

    if (newConfig.timeoutMs < 1000 || newConfig.timeoutMs > 300000) {
      return NextResponse.json(
        {
          success: false,
          error: "timeoutMs must be between 1000 and 300000 ms",
        },
        { status: 400 },
      )
    }

    // Update configuration
    zkpConfig = { ...zkpConfig, ...newConfig }

    // In production, save to database or config file
    console.log("ZKP configuration updated:", zkpConfig)

    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully",
      config: zkpConfig,
    })
  } catch (error) {
    console.error("Update ZKP config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
