// src/pages/api/sales-by-city.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { year, month } = req.query;
  const targetYear = parseInt(year);

  if (isNaN(targetYear)) {
    return res
      .status(400)
      .json({ message: "Valid year parameter is required." });
  }

  const whereClause = { year: targetYear };
  const targetMonth = parseInt(month);
  if (!isNaN(targetMonth) && targetMonth >= 1 && targetMonth <= 12) {
    whereClause.month = targetMonth;
  }

  try {
    // 1. Ambil semua penjualan yang sesuai filter, kelompokkan per outlet
    const salesByOutlet = await prisma.sale.groupBy({
      where: whereClause,
      by: ["outletId"],
      _sum: { net_value: true },
    });

    // 2. Buat "kamus" untuk memetakan outletId ke nama kota
    const outletIds = salesByOutlet.map((s) => s.outletId);
    const outlets = await prisma.outlet.findMany({
      where: { id: { in: outletIds } },
      select: { id: true, city: true },
    });
    const outletToCityMap = new Map(outlets.map((o) => [o.id, o.city]));

    // 3. Agregasi ulang di JavaScript berdasarkan kota
    const salesByCity = new Map();
    for (const sale of salesByOutlet) {
      const cityName = outletToCityMap.get(sale.outletId) || "Lainnya";
      const currentSales = salesByCity.get(cityName) || 0;
      salesByCity.set(cityName, currentSales + (sale._sum.net_value || 0));
    }

    // 4. Format data untuk pie chart
    const formattedData = Array.from(salesByCity.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Urutkan dari terbesar

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching sales by city:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
