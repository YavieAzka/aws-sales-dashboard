// src/components/TopOutletsChart.tsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface OutletData {
  id: string;
  name: string;
  city: string;
  address: string;
  outlet_code: string;
  outlet_class: string;
  totalSales: number;
}

interface ChartProps {
  year: number;
}

// Komponen Tooltip Kustom
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-700 p-3 rounded-md text-sm shadow-lg text-white border border-gray-600">
        <p className="font-bold mb-2 text-base">{data.name}</p>
        <p className="text-gray-300">
          <span className="font-semibold">Kode:</span> {data.outlet_code}
        </p>
        <p className="text-gray-300">
          <span className="font-semibold">Kota:</span> {data.city}
        </p>
        <p className="text-gray-300">
          <span className="font-semibold">Alamat:</span> {data.address}
        </p>
        <p className="text-gray-300">
          <span className="font-semibold">Kelas:</span> {data.outlet_class}
        </p>
        <hr className="my-2 border-gray-500" />
        <p className="font-bold text-indigo-400">
          Total Sales: Rp{" "}
          {new Intl.NumberFormat("id-ID").format(data.totalSales)} Jt
        </p>
      </div>
    );
  }
  return null;
};

export default function TopOutletsChart({ year }: ChartProps) {
  // State untuk setiap filter
  const [limit, setLimit] = useState(10);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Fetching untuk daftar kota
  const { data: cities } = useSWR<string[]>("/api/cities", fetcher);

  // Fetching untuk data utama
  const {
    data: outlets,
    error,
    isLoading,
  } = useSWR<OutletData[]>(
    `/api/top-outlets?year=${year}&month=${selectedMonth}&city=${selectedCity}&n=${limit}`,
    fetcher
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h3 className="font-bold text-lg mb-4">Top Outlet Berdasarkan Omzet</h3>

      {/* --- Baris Filter --- */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Filter Top N */}
        <select
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="bg-gray-700 text-white text-sm p-2 rounded"
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
        </select>

        {/* Filter Kota */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-gray-700 text-white text-sm p-2 rounded"
        >
          <option value="all">Semua Kota</option>
          {cities?.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {/* Filter Bulan */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-gray-700 text-white text-sm p-2 rounded"
        >
          <option value="all">Semua Bulan</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString("id-ID", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {/* --- Bar Chart JSX --- */}
      <div style={{ width: "100%", height: 400 }}>
        {isLoading && (
          <div className="w-full h-full bg-gray-700 animate-pulse rounded-md"></div>
        )}
        {error && (
          <tr>
            <td colSpan={4} className="text-center p-4 text-red-500">
              Gagal memuat data
            </td>
          </tr>
        )}
        {outlets && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={outlets}
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis
                type="number"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) =>
                  `${new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                  }).format(value)} Jt`
                }
              />
              <YAxis
                yAxisId={0}
                type="category"
                dataKey="name"
                width={150}
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis
                yAxisId={1}
                type="category"
                dataKey="city"
                orientation="right"
                width={120}
                stroke="#7dd3fc"
                fontSize={10}
              />
              <Tooltip
                cursor={{ fill: "rgba(136, 132, 216, 0.1)" }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="totalSales"
                name="Total Sales (NET)"
                fill="#818cf8"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
