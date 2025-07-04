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

  // Buat objek filter dasar untuk tahun
  const whereClause = { year: targetYear };

  // Jika ada bulan yang valid, tambahkan ke filter
  const targetMonth = parseInt(month);
  if (!isNaN(targetMonth) && targetMonth >= 1 && targetMonth <= 12) {
    whereClause.month = targetMonth;
  }

  try {
    // LANGKAH 1: Ambil semua data penjualan yang sesuai filter.
    // Sertakan juga nama kota dari outlet yang terhubung.
    const salesData = await prisma.sale.findMany({
      where: whereClause,
      select: {
        net_value: true,
        outlet: {
          select: {
            city: true,
          },
        },
      },
    });

    // LANGKAH 2: Agregasi data di JavaScript
    const salesByCity = new Map();
    for (const sale of salesData) {
      // Jika outlet atau kota tidak ada, beri nama "Lainnya"
      const cityName = sale.outlet?.city || "Lainnya";
      const currentSales = salesByCity.get(cityName) || 0;
      salesByCity.set(cityName, currentSales + sale.net_value);
    }

    // LANGKAH 3: Format data untuk pie chart
    const formattedData = Array.from(salesByCity.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching sales by city:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
