-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL,
    "outlet_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "kecamatan" TEXT,
    "kelurahan" TEXT,
    "outlet_class" TEXT,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "product_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "category" TEXT,
    "principal" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "gross_value" DOUBLE PRECISION NOT NULL,
    "net_value" DOUBLE PRECISION NOT NULL,
    "disc_value" DOUBLE PRECISION NOT NULL,
    "outletId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outlet_outlet_code_key" ON "Outlet"("outlet_code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_product_code_key" ON "Product"("product_code");

-- CreateIndex
CREATE INDEX "Sale_year_month_idx" ON "Sale"("year", "month");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
