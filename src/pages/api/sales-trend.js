// src/pages/api/sales-trend.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const salesTrend = await prisma.sale.groupBy({
      by: ["year", "month"],
      _sum: {
        net_value: true,
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    const formattedData = salesTrend.map((item) => ({
      name: `${new Date(item.year, item.month - 1).toLocaleString("id-ID", {
        month: "short",
      })} '${item.year.toString().slice(-2)}`,
      "Penjualan NET": item._sum.net_value || 0,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching sales trend:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
