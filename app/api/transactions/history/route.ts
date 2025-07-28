import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
<<<<<<< HEAD
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // Build where clause
    const where: any = { userId: decoded.userId }
    if (status) {
      where.status = status
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        zkProof: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count
    const total = await prisma.transaction.count({ where })

    return NextResponse.json({
      success: true,
      transactions,
=======
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const userId = decoded.userId

    // Get all transaction types for the user
    const [transfers, deposits, receivedTransfers] = await Promise.all([
      // Transfers sent by user
      prisma.transfer.findMany({
        where: {
          fromUserId: userId,
          ...(status && { status }),
        },
        include: {
          toUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Deposits by user
      prisma.deposit.findMany({
        where: {
          userId,
          ...(status && { status }),
        },
        orderBy: { createdAt: "desc" },
      }),

      // Transfers received by user
      prisma.transfer.findMany({
        where: {
          toUserId: userId,
          ...(status && { status }),
        },
        include: {
          fromUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ])

    // Transform and combine all transactions
    const allTransactions = [
      // Sent transfers
      ...transfers.map((tx) => ({
        id: tx.id,
        type: "transfer" as const,
        fromAddress: tx.fromWalletAddress,
        toAddress: tx.toWalletAddress,
        amount: tx.amount.toString(),
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
        description: tx.description,
        recipient: {
          name: tx.toUser.name || tx.toUser.email.split("@")[0],
          email: tx.toUser.email,
        },
      })),

      // Deposits
      ...deposits.map((tx) => ({
        id: tx.id,
        type: "deposit" as const,
        amount: tx.amount.toString(),
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
        description: "Nạp tiền vào ví",
      })),

      // Received transfers
      ...receivedTransfers.map((tx) => ({
        id: tx.id,
        type: "received" as const,
        fromAddress: tx.fromWalletAddress,
        toAddress: tx.toWalletAddress,
        amount: tx.amount.toString(),
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
        description: tx.description,
        sender: {
          name: tx.fromUser.name || tx.fromUser.email.split("@")[0],
          email: tx.fromUser.email,
        },
      })),
    ]

    // Sort by date and apply filters
    let filteredTransactions = allTransactions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    if (type && type !== "all") {
      filteredTransactions = filteredTransactions.filter((tx) => tx.type === type)
    }

    // Pagination
    const total = filteredTransactions.length
    const paginatedTransactions = filteredTransactions.slice((page - 1) * limit, page * limit)

    // Calculate statistics
    const stats = {
      totalTransactions: allTransactions.length,
      totalSent: transfers
        .filter((tx) => tx.status === "completed")
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
        .toFixed(2),
      totalReceived: receivedTransfers
        .filter((tx) => tx.status === "completed")
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
        .toFixed(2),
      totalDeposits: deposits
        .filter((tx) => tx.status === "completed")
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
        .toFixed(2),
      successRate:
        allTransactions.length > 0
          ? Math.round(
              (allTransactions.filter((tx) => tx.status === "completed").length / allTransactions.length) * 100,
            )
          : 0,
    }

    return NextResponse.json({
      success: true,
      transactions: paginatedTransactions,
      stats,
>>>>>>> 063705e (Initial commit)
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Transaction history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
