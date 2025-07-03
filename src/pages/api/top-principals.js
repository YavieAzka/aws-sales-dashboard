// src/pages/api/top-principals.js (Versi Perbaikan Logika)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    // LANGKAH 1: Dapatkan total penjualan untuk SEMUA produk
    const salesByProduct = await prisma.sale.groupBy({
      by: ["productId"],
      _sum: {
        net_value: true,
      },
    });

    // LANGKAH 2: Dapatkan semua produk untuk membuat pemetaan productId -> principal
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        principal: true,
      },
    });

    const productToPrincipalMap = new Map(
      allProducts.map((p) => [p.id, p.principal])
    );

    // LANGKAH 3: Agregasi ulang di JavaScript berdasarkan prinsipal
    const salesByPrincipal = new Map();

    for (const sale of salesByProduct) {
      const principalName = productToPrincipalMap.get(sale.productId);
      if (principalName) {
        // Hanya proses jika prinsipalnya ada
        const currentSales = salesByPrincipal.get(principalName) || 0;
        salesByPrincipal.set(
          principalName,
          currentSales + (sale._sum.net_value || 0)
        );
      }
    }

    // LANGKAH 4: Ubah Map menjadi array, urutkan, dan ambil 5 teratas
    const sortedPrincipals = Array.from(salesByPrincipal.entries())
      .map(([name, totalSales]) => ({ name, totalSales }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    res.status(200).json(sortedPrincipals);
  } catch (error) {
    console.error("Error fetching top principals:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
}
