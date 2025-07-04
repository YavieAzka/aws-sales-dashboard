// src/pages/api/cities.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const cities = await prisma.outlet.findMany({
      where: {
        city: {
          not: null,
        },
      },
      distinct: ["city"],
      select: {
        city: true,
      },
      orderBy: {
        city: "asc",
      },
    });

    // Ubah format dari [{city: 'A'}, {city: 'B'}] menjadi ['A', 'B']
    const cityList = cities.map((c) => c.city);
    res.status(200).json(cityList);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
