// src/pages/index.tsx
"use client";
import useSWR from "swr";
import KPICard from "@/components/KPICard";
import TopPrincipalsChart from "@/components/TopPrincipalsChart";
import SalesTrendChart from "@/components/SalesTrendChart";
import FinisherBackground from "@/components/FinisherBackground";
import { useState } from "react";
import SalesByCityChart from "@/components/SalesByCityChart";
import { useEffect } from "react";

interface KpiData {
  total_net_sales: number;
  total_outlets: number;
  total_products: number;
}

// fetcher adalah fungsi sederhana untuk mengambil data dari URL
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const [selectedYear, setSelectedYear] = useState(2024);

  // Gunakan hook SWR untuk fetch data
  const { data, error, isLoading } = useSWR<KpiData>(
    `/api/kpi?year=${selectedYear}`,
    fetcher
  );

  if (error)
    return <div className="text-red-500">Failed to load KPI data.</div>;

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Finisher target */}
      <div className="finisher-header absolute top-0 left-0 w-full min-h-full z-0" />

      {/* Inisialisasi Finisher */}
      <FinisherBackground />

      {/* Konten utama */}
      <main className="relative z-10 p-8 pb-20">
        <h1 className="text-4xl font-bold text-white mb-4">Sales Dashboard</h1>
        <h2 className="font-bold text-white mb-8">
          Terakhir di-update: --:--:--
        </h2>
        <div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-gray-800 text-white p-2 rounded-lg mb-4"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Penjualan (NET)"
            value={data?.total_net_sales.toFixed(0) || 0}
            isLoading={isLoading}
          />
          <KPICard
            title="Jumlah Outlet Unik"
            value={data?.total_outlets || 0}
            isLoading={isLoading}
          />
          <KPICard
            title="Jumlah Produk Unik"
            value={data?.total_products || 0}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPrincipalsChart year={selectedYear} />
          <SalesByCityChart year={selectedYear} />
          {/* 2. Tambahkan komponen baru di sini. `col-span-2` membuatnya memakan lebar penuh */}
          <div className="lg:col-span-2">
            <SalesTrendChart year={selectedYear} />
          </div>
        </div>
      </main>
    </div>
  );
}
