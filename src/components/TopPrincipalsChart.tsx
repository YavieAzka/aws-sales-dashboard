// src/components/TopPrincipalsChart.tsx
"use client";

import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// 1. Definisikan tipe untuk props
interface ChartProps {
  year: number;
}

const months = [
  { value: "all", label: "Semua Bulan" },
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

export default function TopPrincipalsChart({ year }: ChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | number>("all");
  const { data, error, isLoading } = useSWR(
    `/api/top-principals?year=${year}&month=${selectedMonth}`,
    fetcher
  );

  if (error) return <div>Failed to load chart</div>;
  if (isLoading)
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-80 animate-pulse"></div>
    );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h3 className="font-bold mb-4">Top 5 Principals by Net Sales - {year}</h3>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="bg-gray-700 text-white text-sm p-1 rounded mb-4"
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickFormatter={(value) =>
              `${new Intl.NumberFormat("id-ID", { notation: "compact" }).format(
                value
              )} Jt`
            }
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            formatter={(value: number) =>
              `Rp ${new Intl.NumberFormat("id-ID").format(value)} Jt`
            }
          />
          <Legend />
          <Bar dataKey="totalSales" fill="#4f46e5" name="Total Sales (NET)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
