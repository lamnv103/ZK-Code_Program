/*
  Warnings:

  - You are about to alter the column `amount` on the `deposit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(20,8)`.
  - You are about to alter the column `amount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Decimal(20,8)`.

*/
-- DropIndex
DROP INDEX `Transaction_zkProofHash_key` ON `transaction`;

-- AlterTable
ALTER TABLE `deposit` MODIFY `amount` DECIMAL(20, 8) NOT NULL,
    MODIFY `virtualQrCodeUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `transaction` MODIFY `amount` DECIMAL(20, 8) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `name` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Deposit_userId_status_idx` ON `Deposit`(`userId`, `status`);

-- CreateIndex
CREATE INDEX `Deposit_createdAt_idx` ON `Deposit`(`createdAt`);

-- CreateIndex
CREATE INDEX `Transaction_userId_status_idx` ON `Transaction`(`userId`, `status`);

-- CreateIndex
CREATE INDEX `Transaction_createdAt_idx` ON `Transaction`(`createdAt`);
