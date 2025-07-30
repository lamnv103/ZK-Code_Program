import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { filters, searchTerm, transactions: transactionIds } = await request.json()

    // Get detailed transaction data for export
    const transactions = await prisma.transaction.findMany({
      where: {
        id: {
          in: transactionIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
            name: true,
          },
        },
        zkProof: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Generate CSV content
    const csvHeaders = [
      "Transaction ID",
      "From Address",
      "To Address",
      "Amount (ETH)",
      "Status",
      "User Email",
      "User Name",
      "ZK Proof ID",
      "ZK Proof Hash",
      "Created At",
      "Updated At",
    ]

    const csvRows = transactions.map((tx) => [
      tx.id,
      tx.fromAddress,
      tx.toAddress,
      tx.amount.toString(),
      tx.status,
      tx.user?.email || "",
      tx.user?.name || "",
      tx.zkProof?.id || "",
      tx.zkProofHash || "",
      tx.createdAt.toISOString(),
      tx.updatedAt.toISOString(),
    ])

    // Create CSV content
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = "\uFEFF"
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
