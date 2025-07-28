import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface BalanceInfo {
  balance: bigint;
  commitment: string;
  nonce: bigint;
  salt: bigint;
}

export class BalanceManager {
  private static instance: BalanceManager;

  static getInstance(): BalanceManager {
    if (!BalanceManager.instance) {
      BalanceManager.instance = new BalanceManager();
    }
    return BalanceManager.instance;
  }

  // 🔐 AES Encrypt
  private encrypt(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const hashedKey = crypto.createHash("sha256").update(key).digest();
    const cipher = crypto.createCipheriv("aes-256-cbc", hashedKey, iv);
    const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  // 🔓 AES Decrypt (an toàn hơn)
  private decrypt(encryptedData: string, key: string): string {
    if (!encryptedData || typeof encryptedData !== "string") {
      throw new Error("Encrypted data is missing or invalid");
    }
    if (!key || typeof key !== "string") {
      throw new Error("Decryption key is missing or invalid");
    }

    const parts = encryptedData.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted data format");
    }

    const [ivHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const hashedKey = crypto.createHash("sha256").update(key).digest();
    const decipher = crypto.createDecipheriv("aes-256-cbc", hashedKey, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  }

  // 📦 Lấy số dư người dùng
  async getUserBalance(userId: string, userKey: string): Promise<BalanceInfo> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { balance: true },
      });

      if (!user) throw new Error("User not found");

      // Mặc định nếu chưa có dữ liệu
      let balance = BigInt("1000000000000000000000"); // 1000 ETH
      let nonce = BigInt("0x" + crypto.randomBytes(16).toString("hex"));
      let salt = BigInt("0x" + crypto.randomBytes(16).toString("hex"));

      if (user.balance?.encryptedBalance && typeof user.balance.encryptedBalance === "string") {
        try {
          const decrypted = this.decrypt(user.balance.encryptedBalance, userKey);
          const data = JSON.parse(decrypted);
          balance = BigInt(data.balance);
          nonce = BigInt(data.nonce);
          salt = BigInt(data.salt);
        } catch (err) {
          console.warn("⚠️ Giải mã thất bại, sử dụng mặc định:", err);
        }
      }

      return {
        balance,
        commitment: user.balance?.commitment || "",
        nonce,
        salt,
      };
    } catch (error) {
      console.error("❌ Lỗi khi lấy số dư:", error);
      throw new Error("Không thể lấy thông tin số dư");
    }
  }

  // 🔁 Cập nhật số dư
  async updateUserBalance(
    userId: string,
    userKey: string,
    newBalance: bigint,
    newNonce: bigint,
    salt: bigint,
    newCommitment: string,
  ): Promise<void> {
    try {
      const data = {
        balance: newBalance.toString(),
        nonce: newNonce.toString(),
        salt: salt.toString(),
      };

      const encrypted = this.encrypt(JSON.stringify(data), userKey);

      await prisma.balance.upsert({
        where: { userId },
        update: {
          encryptedBalance: encrypted,
          commitment: newCommitment,
          lastUpdated: new Date(),
        },
        create: {
          userId,
          encryptedBalance: encrypted,
          commitment: newCommitment,
        },
      });

      console.log(`✅ Đã cập nhật số dư cho user ${userId}`);
    } catch (error) {
      console.error("❌ Lỗi cập nhật số dư:", error);
      throw new Error("Không thể cập nhật số dư");
    }
  }

  // 🔐 Tạo commitment hash từ balance, nonce, salt
  createCommitment(balance: bigint, nonce: bigint, salt: bigint): string {
    const data = `${balance}-${nonce}-${salt}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  // ✅ Xác minh commitment
  validateCommitment(balance: bigint, nonce: bigint, salt: bigint, expectedCommitment: string): boolean {
    const actual = this.createCommitment(balance, nonce, salt);
    return actual === expectedCommitment;
  }
}
