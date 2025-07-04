// src/components/SalesByCityChart.tsx
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00c49f",
  "#a9a9a9",
];

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

interface CitySale {
  name: string;
  value: number;
}

interface ChartProps {
  year: number;
}

// Komponen Tooltip Kustom
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Jika nama irisan adalah 'Lainnya', tampilkan detailnya
    if (data.name === "Lainnya" && data.others) {
      return (
        <div className="bg-gray-700 p-3 rounded-md text-sm shadow-lg text-white">
          <p className="font-bold mb-2">Lainnya ({data.others.length} Kota):</p>
          <ul className="list-disc list-inside">
            {data.others.map((item: CitySale) => (
              <li key={item.name}>
                {item.name}: Rp{" "}
                {new Intl.NumberFormat("id-ID").format(item.value)} Jt
              </li>
            ))}
          </ul>
        </div>
      );
    }
    // Tooltip normal untuk irisan lain
    return (
      <div className="bg-gray-700 p-2 rounded-md text-sm shadow-lg text-white">
        <p className="font-bold">{data.name}</p>
        <p>Rp {new Intl.NumberFormat("id-ID").format(data.value)} Jt</p>
      </div>
    );
  }
  return null;
};

export default function SalesByCityChart({ year }: ChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | number>("all");
  const {
    data: rawData,
    error,
    isLoading,
  } = useSWR<CitySale[]>(
    `/api/sales-by-city?year=${year}&month=${selectedMonth}`,
    fetcher
  );

  // Logika untuk memproses dan mengelompokkan data
  const processedData = (() => {
    if (!rawData) return [];

    const totalValue = rawData.reduce((sum, item) => sum + item.value, 0);
    const thresholdPercentage = 0.05; // Batas 5%

    const mainData: CitySale[] = [];
    const others: CitySale[] = [];

    rawData.forEach((item) => {
      if (item.value / totalValue >= thresholdPercentage) {
        mainData.push(item);
      } else {
        others.push(item);
      }
    });

    const othersTotal = others.reduce((sum, item) => sum + item.value, 0);

    if (others.length > 0) {
      // Sertakan data 'others' di dalam payload irisan 'Lainnya'
      return [
        ...mainData,
        { name: "Lainnya", value: othersTotal, others: others },
      ];
    }

    return mainData;
  })();

  if (error) return <div>Gagal memuat data chart</div>;
  if (isLoading)
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-96 animate-pulse"></div>
    );
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Jangan tampilkan persentase jika terlalu kecil
    if ((percent || 0) * 100 < 3) {
      return null;
    }

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Kontribusi Omzet per Kota - {year}</h3>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-gray-700 text-white text-sm p-1 rounded"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            labelLine={false}
            label={renderCustomizedLabel} // <-- TERAPKAN FUNGSI DI SINI
          >
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
