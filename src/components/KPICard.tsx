// src/components/KPICard.tsx
interface KPICardProps {
  title: string;
  value: number | string;
  isLoading: boolean;
}

export default function KPICard({ title, value, isLoading }: KPICardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-sm font-medium text-gray-400">{title}</h2>
      {isLoading ? (
        <div className="h-10 w-3/4 bg-gray-700 animate-pulse rounded-md mt-1"></div>
      ) : (
        <p className="text-3xl font-bold mt-1">
          {/* Format angka agar lebih mudah dibaca */}
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
      )}
    </div>
  );
}
