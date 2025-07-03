// scripts/ingest.js (Versi CEPAT dengan Batch Processing)
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data ingestion process...");

  // --- FASE 1: KOLEKSI DATA (IN-MEMORY) ---
  console.log("Reading and collecting data from CSV...");
  const { outletMap, productMap, salesData } = await processCsv();

  // --- FASE 2: BATCH INSERT OUTLET & PRODUK ---
  console.log(
    `Inserting ${outletMap.size} unique outlets and ${productMap.size} unique products...`
  );

  // Ubah Map menjadi array untuk createMany
  const outletArray = Array.from(outletMap.values());
  const productArray = Array.from(productMap.values());

  // Gunakan createMany untuk efisiensi tinggi
  await prisma.outlet.createMany({ data: outletArray, skipDuplicates: true });
  await prisma.product.createMany({ data: productArray, skipDuplicates: true });

  // --- FASE 3: MAPPING & BATCH INSERT SALES ---
  console.log("Preparing sales data with foreign keys...");

  // Ambil kembali semua outlet dan produk yang sudah ada di DB untuk mendapatkan ID mereka
  const allOutlets = await prisma.outlet.findMany({
    select: { id: true, outlet_code: true },
  });
  const allProducts = await prisma.product.findMany({
    select: { id: true, product_code: true },
  });

  // Buat lookup map untuk pencarian ID yang cepat
  const outletCodeToIdMap = new Map(
    allOutlets.map((o) => [o.outlet_code, o.id])
  );
  const productCodeToIdMap = new Map(
    allProducts.map((p) => [p.product_code, p.id])
  );

  // Siapkan data sales final dengan outletId dan productId
  const salesToCreate = salesData
    .map((sale) => {
      const outletId = outletCodeToIdMap.get(sale.outlet_code);
      const productId = productCodeToIdMap.get(sale.product_code);

      // Pastikan ID ditemukan sebelum membuat relasi
      if (!outletId || !productId) return null;

      return {
        year: sale.year,
        month: sale.month,
        gross_value: sale.gross_value,
        net_value: sale.net_value,
        disc_value: sale.disc_value,
        outletId,
        productId,
      };
    })
    .filter(Boolean); // Filter out null values

  const chunkSize = 10000; // Kita akan memasukkan data per 10.000 baris
  console.log(
    `Inserting ${salesToCreate.length} sale records in chunks of ${chunkSize}...`
  );

  for (let i = 0; i < salesToCreate.length; i += chunkSize) {
    const chunk = salesToCreate.slice(i, i + chunkSize);

    await prisma.sale.createMany({
      data: chunk,
    });

    console.log(
      `$ Inserted chunk ${i / chunkSize + 1} of ${Math.ceil(
        salesToCreate.length / chunkSize
      )}`
    );
  }

  console.log("✅ Data ingestion finished successfully!");
}

function processCsv() {
  return new Promise((resolve, reject) => {
    const outletMap = new Map();
    const productMap = new Map();
    const salesData = [];

    const __filename = fileURLToPath(import.meta.url);
    const scriptDir = path.dirname(__filename);
    const csvFilePath = path.join(
      scriptDir,
      "../data/data-miniature3_with_no.csv"
    ); // Pastikan ini nama file 100rb baris Anda
    const fileStream = fs.createReadStream(csvFilePath, "utf-8");

    Papa.parse(fileStream, {
      header: true,
      step: function (results) {
        const row = results.data;

        // Koleksi data outlet unik
        if (!outletMap.has(row["Outlet Code"])) {
          outletMap.set(row["Outlet Code"], {
            outlet_code: row["Outlet Code"],
            name: row["Outlet Name"],
            address: row["Address"],
            city: row["Kota/Kab"],
            kecamatan: row["Kecamatan"],
            kelurahan: row["Kelurahan"],
            outlet_class: row["Outlet Class"],
          });
        }

        // Koleksi data produk unik
        if (!productMap.has(row["Cd Product"])) {
          productMap.set(row["Cd Product"], {
            product_code: row["Cd Product"],
            name: row["Nm Product"],
            brand: row["BRAND"],
            category: row["CATEGORY"],
            principal: row["Prinsipal"],
          });
        }

        // Koleksi dan transformasi data sales
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, "0");
          const netValue = parseFloat(row[`${monthStr}-NET`]);

          if (netValue && netValue > 0) {
            salesData.push({
              outlet_code: row["Outlet Code"],
              product_code: row["Cd Product"],
              year: parseInt(row["YEAR"]),
              month: month,
              net_value: netValue,
              gross_value: parseFloat(row[`${monthStr}-GROSS`]) || 0,
              disc_value: parseFloat(row[`${monthStr}-DISC`]) || 0,
            });
          }
        }
      },
      complete: () => resolve({ outletMap, productMap, salesData }),
      error: (err) => reject(err),
    });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// node -r @swc-node/register scripts/ingest.js
