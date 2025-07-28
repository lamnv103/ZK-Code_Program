/*
  Warnings:

  - A unique constraint covering the columns `[zkProofHash]` on the table `ZkProof` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Transaction_zkProofHash_key` ON `transaction`;

-- AlterTable
ALTER TABLE `zkproof` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `zkProofHash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ZkProof_zkProofHash_key` ON `ZkProof`(`zkProofHash`);
