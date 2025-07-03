// src/pages/index.tsx
"use client";
import useSWR from "swr";
import KPICard from "@/components/KPICard";
import TopPrincipalsChart from "@/components/TopPrincipalsChart";
import SalesTrendChart from "@/components/SalesTrendChart";

interface KpiData {
  total_net_sales: number;
  total_outlets: number;
  total_products: number;
}

// fetcher adalah fungsi sederhana untuk mengambil data dari URL
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  // Gunakan hook SWR untuk fetch data
  const { data, error, isLoading } = useSWR<KpiData>("/api/kpi", fetcher);

  if (error)
    return <div className="text-red-500">Failed to load KPI data.</div>;

  return (
    <main className="bg-[#0C0C0C] min-h-screen p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Sales Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 gap-6 mt-12">
        <TopPrincipalsChart />
        <SalesTrendChart />
      </div>
    </main>
  );
}
