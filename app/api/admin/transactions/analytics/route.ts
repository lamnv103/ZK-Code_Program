import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d" // 7d, 30d, 90d, 1y

    const startDate = new Date()
    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(startDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    // Get analytics data
    const [transactionTrends, statusDistribution, volumeAnalysis, userActivity, hourlyDistribution] = await Promise.all(
      [
        // Transaction trends over time
        prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END) as volume
        FROM Transaction 
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

        // Status distribution
        prisma.transaction.groupBy({
          by: ["status"],
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          _count: {
            status: true,
          },
          _sum: {
            amount: true,
          },
        }),

        // Volume analysis by amount ranges
        prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN amount < 0.1 THEN 'Small (< 0.1 ETH)'
            WHEN amount < 1 THEN 'Medium (0.1-1 ETH)'
            WHEN amount < 10 THEN 'Large (1-10 ETH)'
            ELSE 'Very Large (> 10 ETH)'
          END as range_category,
          COUNT(*) as count,
          SUM(amount) as total_volume
        FROM Transaction 
        WHERE created_at >= ${startDate}
        GROUP BY range_category
        ORDER BY total_volume DESC
      `,

        // Top users by transaction count
        prisma.$queryRaw`
        SELECT 
          u.email,
          u.id as user_id,
          COUNT(t.id) as transaction_count,
          SUM(CASE WHEN t.status = 'verified' THEN t.amount ELSE 0 END) as total_volume
        FROM Transaction t
        JOIN User u ON t.userId = u.id
        WHERE t.created_at >= ${startDate}
        GROUP BY u.id, u.email
        ORDER BY transaction_count DESC
        LIMIT 10
      `,

        // Hourly distribution
        prisma.$queryRaw`
        SELECT 
          HOUR(created_at) as hour,
          COUNT(*) as count
        FROM Transaction 
        WHERE created_at >= ${startDate}
        GROUP BY HOUR(created_at)
        ORDER BY hour ASC
      `,
      ],
    )

    return NextResponse.json({
      success: true,
      analytics: {
        period,
        transactionTrends,
        statusDistribution,
        volumeAnalysis,
        userActivity,
        hourlyDistribution,
      },
    })
  } catch (error) {
    console.error("Transaction analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
