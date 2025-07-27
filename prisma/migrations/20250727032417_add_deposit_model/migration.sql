/*
  Warnings:

  - You are about to alter the column `amount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,8)` to `Decimal(18,2)`.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[zkProofHash]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `balance` MODIFY `encryptedBalance` TEXT NOT NULL,
    MODIFY `commitment` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `amount` DECIMAL(18, 2) NOT NULL,
    MODIFY `zkProofHash` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    MODIFY `encryptedKey` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `Deposit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `virtualQrCodeUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Transaction_zkProofHash_key` ON `Transaction`(`zkProofHash`);

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
