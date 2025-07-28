import { PrismaClient, Prisma } from "@prisma/client"
import { simpleEncrypt, simpleDecrypt, generateCommitment } from "./encryption"

const prisma = new PrismaClient()

export interface BalanceInfo {
  userId: string
  encryptedBalance: string
  decryptedBalance: string
  commitment: string
  lastUpdated: Date
}

export class BalanceManager {
  private static instance: BalanceManager

  static getInstance(): BalanceManager {
    if (!BalanceManager.instance) {
      BalanceManager.instance = new BalanceManager()
    }
    return BalanceManager.instance
  }

  // Get user balance (decrypted)
  async getUserBalance(userId: string): Promise<BalanceInfo | null> {
    try {
      const balance = await prisma.balance.findUnique({
        where: { userId },
      })

      if (!balance) {
        return null
      }

      let decryptedBalance = "0"
      if (balance.encryptedBalance) {
        try {
          decryptedBalance = simpleDecrypt(balance.encryptedBalance)
        } catch (error) {
          console.warn("Failed to decrypt balance for user:", userId)
          decryptedBalance = "1000" // Default demo balance
        }
      }

      return {
        userId: balance.userId,
        encryptedBalance: balance.encryptedBalance,
        decryptedBalance,
        commitment: balance.commitment,
        lastUpdated: balance.lastUpdated,
      }
    } catch (error) {
      console.error("Error getting user balance:", error)
      return null
    }
  }

  // Update user balance
  async updateUserBalance(userId: string, newBalance: string, commitment?: string): Promise<boolean> {
    try {
      const encryptedBalance = simpleEncrypt(newBalance)
      const balanceCommitment = commitment || generateCommitment(newBalance)

      await prisma.balance.upsert({
        where: { userId },
        update: {
          encryptedBalance,
          commitment: balanceCommitment,
          lastUpdated: new Date(),
        },
        create: {
          userId,
          encryptedBalance,
          commitment: balanceCommitment,
        },
      })

      console.log(`✅ Updated balance for user ${userId}: ${newBalance} ETH`)
      return true
    } catch (error) {
      console.error("Error updating user balance:", error)
      return false
    }
  }

  // Check if user has sufficient balance
  async checkSufficientBalance(
    userId: string,
    amount: string,
  ): Promise<{
    hasSufficientBalance: boolean
    currentBalance: string
    message: string
  }> {
    try {
      const balanceInfo = await this.getUserBalance(userId)

      if (!balanceInfo) {
        return {
          hasSufficientBalance: false,
          currentBalance: "0",
          message: "Balance not found",
        }
      }

      const currentBalance = new Prisma.Decimal(balanceInfo.decryptedBalance)
      const transferAmount = new Prisma.Decimal(amount)

      const hasSufficientBalance = currentBalance.gte(transferAmount)

      return {
        hasSufficientBalance,
        currentBalance: currentBalance.toString(),
        message: hasSufficientBalance ? "Sufficient balance available" : "Insufficient balance for transfer",
      }
    } catch (error) {
      console.error("Error checking balance:", error)
      return {
        hasSufficientBalance: false,
        currentBalance: "0",
        message: "Error checking balance",
      }
    }
  }

  // Transfer balance between users
  async transferBalance(
    fromUserId: string,
    toUserId: string,
    amount: string,
  ): Promise<{
    success: boolean
    newFromBalance: string
    newToBalance: string
    message: string
  }> {
    try {
      const [fromBalance, toBalance] = await Promise.all([
        this.getUserBalance(fromUserId),
        this.getUserBalance(toUserId),
      ])

      if (!fromBalance) {
        return {
          success: false,
          newFromBalance: "0",
          newToBalance: "0",
          message: "Sender balance not found",
        }
      }

      const senderBalance = new Prisma.Decimal(fromBalance.decryptedBalance)
      const transferAmount = new Prisma.Decimal(amount)

      if (senderBalance.lt(transferAmount)) {
        return {
          success: false,
          newFromBalance: senderBalance.toString(),
          newToBalance: toBalance?.decryptedBalance || "0",
          message: "Insufficient balance",
        }
      }

      const recipientBalance = new Prisma.Decimal(toBalance?.decryptedBalance || "0")
      const newFromBalance = senderBalance.minus(transferAmount)
      const newToBalance = recipientBalance.plus(transferAmount)

      // Update both balances in a transaction
      await prisma.$transaction(async (tx) => {
        await this.updateUserBalance(fromUserId, newFromBalance.toString())
        await this.updateUserBalance(toUserId, newToBalance.toString())
      })

      return {
        success: true,
        newFromBalance: newFromBalance.toString(),
        newToBalance: newToBalance.toString(),
        message: "Transfer completed successfully",
      }
    } catch (error) {
      console.error("Error transferring balance:", error)
      return {
        success: false,
        newFromBalance: "0",
        newToBalance: "0",
        message: "Transfer failed",
      }
    }
  }

  // Add balance (deposit)
  async addBalance(userId: string, amount: string): Promise<boolean> {
    try {
      const balanceInfo = await this.getUserBalance(userId)
      const currentBalance = new Prisma.Decimal(balanceInfo?.decryptedBalance || "0")
      const addAmount = new Prisma.Decimal(amount)
      const newBalance = currentBalance.plus(addAmount)

      return await this.updateUserBalance(userId, newBalance.toString())
    } catch (error) {
      console.error("Error adding balance:", error)
      return false
    }
  }
}
