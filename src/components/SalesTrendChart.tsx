// src/components/SalesTrendChart.tsx
"use client";

import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SalesTrendChart() {
  const { data, error, isLoading } = useSWR("/api/sales-trend", fetcher);

  if (error) return <div>Failed to load chart</div>;
  if (isLoading)
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-80 animate-pulse"></div>
    );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h3 className="font-bold mb-4 text-3xl">Tren Penjualan Bulanan (NET)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickFormatter={(value) =>
              new Intl.NumberFormat("id-ID", { notation: "compact" }).format(
                value
              )
            }
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            formatter={(value: number) =>
              `Rp ${new Intl.NumberFormat("id-ID").format(value)}`
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Penjualan NET"
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
