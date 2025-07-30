import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Simulate log entries
    const logLevels = ["info", "warn", "error", "debug"]
    const logMessages = [
      "ZK Proof verification completed successfully",
      "New proof added to verification queue",
      "Circuit compilation finished",
      "Verification key updated",
      "Prover service restarted",
      "High memory usage detected",
      "Proof verification failed: invalid public signals",
      "System performance metrics collected",
      "Configuration updated by admin",
      "Batch verification completed",
    ]

    const logs = []
    for (let i = 0; i < limit; i++) {
      const logLevel = logLevels[Math.floor(Math.random() * logLevels.length)]
      const message = logMessages[Math.floor(Math.random() * logMessages.length)]
      const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Last 24 hours

      if (level === "all" || level === logLevel) {
        logs.push({
          id: `log_${i}`,
          level: logLevel,
          message,
          timestamp: timestamp.toISOString(),
          service: ["prover", "verifier", "compiler", "api"][Math.floor(Math.random() * 4)],
        })
      }
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      logs: logs.slice(0, limit),
      total: logs.length,
    })
  } catch (error) {
    console.error("Logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
