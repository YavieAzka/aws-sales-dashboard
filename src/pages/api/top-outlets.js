// src/pages/api/top-outlets.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Ambil semua parameter dari query
  const { year, month, city, n } = req.query;

  // Validasi & siapkan parameter
  const targetYear = parseInt(year);
  const limit = parseInt(n) || 10; // Default Top 10 jika n tidak ada

  if (isNaN(targetYear)) {
    return res.status(400).json({ message: "Parameter 'year' wajib diisi" });
  }

  // Bangun klausa WHERE secara dinamis
  const whereClause = {
    year: targetYear,
  };

  const targetMonth = parseInt(month);
  if (!isNaN(targetMonth)) {
    whereClause.month = targetMonth;
  }

  // Tambahkan filter kota jika ada, dan bukan 'all'
  if (city && city !== "all") {
    whereClause.outlet = {
      city: city,
    };
  }

  try {
    // Query utama untuk mendapatkan Top-N Outlet berdasarkan penjualan
    const topSalesByOutlet = await prisma.sale.groupBy({
      where: whereClause,
      by: ["outletId"],
      _sum: { net_value: true },
      orderBy: { _sum: { net_value: "desc" } },
      take: limit,
    });

    const topOutletIds = topSalesByOutlet.map((s) => s.outletId);

    // Ambil detail untuk outlet-outlet teratas
    const topOutletsDetails = await prisma.outlet.findMany({
      where: { id: { in: topOutletIds } },
    });

    const outletDetailsMap = new Map(topOutletsDetails.map((o) => [o.id, o]));

    // Gabungkan data penjualan dengan data detail outlet
    const responseData = topSalesByOutlet.map((sale) => {
      const details = outletDetailsMap.get(sale.outletId);
      return {
        ...details, // semua detail outlet (name, city, address, etc)
        totalSales: sale._sum.net_value || 0,
      };
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching top outlets:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
