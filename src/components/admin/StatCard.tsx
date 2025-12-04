import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  className,
}: StatCardProps) {
  const isPositive = change && change > 0;

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gray-100 rounded-xl">{icon}</div>
        )}
      </div>
    </div>
  );
}
