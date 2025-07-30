import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simulate system performance metrics
    const performance = {
      cpu: {
        usage: Math.floor(Math.random() * 30) + 30, // 30-60%
        cores: 8,
        frequency: "3.2 GHz",
      },
      memory: {
        usage: Math.floor(Math.random() * 40) + 40, // 40-80%
        total: "32 GB",
        available: "12 GB",
      },
      disk: {
        usage: Math.floor(Math.random() * 20) + 20, // 20-40%
        total: "1 TB",
        available: "600 GB",
      },
      network: {
        inbound: Math.floor(Math.random() * 100) + 50, // MB/s
        outbound: Math.floor(Math.random() * 50) + 25, // MB/s
      },
      zkp: {
        queueSize: Math.floor(Math.random() * 10),
        processingRate: Math.floor(Math.random() * 20) + 30, // proofs/minute
        errorRate: (Math.random() * 2).toFixed(2) + "%",
      },
    }

    return NextResponse.json({
      success: true,
      performance,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Performance metrics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
