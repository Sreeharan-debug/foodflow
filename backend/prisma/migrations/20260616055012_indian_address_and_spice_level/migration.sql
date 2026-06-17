/*
  Warnings:

  - You are about to drop the column `street` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Address` table. All the data in the column will be lost.
  - Added the required column `area` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `houseNumber` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "street",
DROP COLUMN "zipCode",
ADD COLUMN     "area" TEXT NOT NULL,
ADD COLUMN     "buildingName" TEXT,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "houseNumber" TEXT NOT NULL,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "pincode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "spiceLevel" TEXT DEFAULT 'Medium';
