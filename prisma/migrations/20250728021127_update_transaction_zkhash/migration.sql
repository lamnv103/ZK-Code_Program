/*
  Warnings:

  - A unique constraint covering the columns `[zkProofHash]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Transaction_zkProofHash_key` ON `Transaction`(`zkProofHash`);
