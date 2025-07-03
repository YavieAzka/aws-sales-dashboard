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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TopPrincipalsChart() {
  const { data, error, isLoading } = useSWR("/api/top-principals", fetcher);

  if (error) return <div>Failed to load chart</div>;
  if (isLoading)
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-80 animate-pulse"></div>
    );

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h3 className="font-bold mb-4 text-3xl">Top 5 Principals by Net Sales</h3>
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
            tickFormatter={(value: number) =>
              `${new Intl.NumberFormat("id-ID").format(value)} Jt`
            }
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
            formatter={(value: number) =>
              `${new Intl.NumberFormat("id-ID").format(value)} Jt`
            }
          />
          <Legend />
          <Bar dataKey="totalSales" fill="#4f46e5" name="Total Sales (NET)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
