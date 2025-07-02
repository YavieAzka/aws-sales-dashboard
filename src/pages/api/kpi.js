// src/pages/api/kpi.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const totalNetSales = await prisma.sale.aggregate({
      _sum: {
        net_value: true,
      },
    });

    const totalOutlets = await prisma.outlet.count();
    const totalProducts = await prisma.product.count();

    const kpiData = {
      total_net_sales: totalNetSales._sum.net_value || 0,
      total_outlets: totalOutlets,
      total_products: totalProducts,
    };

    res.status(200).json(kpiData);
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
