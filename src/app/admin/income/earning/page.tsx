import { DollarSign, TrendingUp, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";
import { formatPrice } from "@/lib/utils";

const earningData = {
  totalEarning: 45680000,
  thisMonth: 8450000,
  lastMonth: 7230000,
  pendingPayout: 2340000,
};

const transactions = [
  { id: 1, type: "sale", description: "오버핏 코튼 티셔츠", amount: 29000, date: "2024-11-29" },
  { id: 2, type: "sale", description: "와이드 데님 팬츠", amount: 59000, date: "2024-11-29" },
  { id: 3, type: "refund", description: "크롭 가디건 환불", amount: -45000, date: "2024-11-28" },
  { id: 4, type: "sale", description: "미니멀 토트백", amount: 38000, date: "2024-11-28" },
  { id: 5, type: "sale", description: "레더 자켓", amount: 129000, date: "2024-11-27" },
  { id: 6, type: "payout", description: "정산 출금", amount: -500000, date: "2024-11-25" },
];

export default function EarningPage() {
  const monthlyGrowth = ((earningData.thisMonth - earningData.lastMonth) / earningData.lastMonth * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earning</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earning"
          value={formatPrice(earningData.totalEarning)}
          change={15.2}
          icon={<DollarSign size={24} className="text-green-600" />}
        />
        <StatCard
          title="This Month"
          value={formatPrice(earningData.thisMonth)}
          change={parseFloat(monthlyGrowth)}
          icon={<TrendingUp size={24} className="text-blue-600" />}
        />
        <StatCard
          title="Last Month"
          value={formatPrice(earningData.lastMonth)}
          icon={<CreditCard size={24} className="text-purple-600" />}
        />
        <StatCard
          title="Pending Payout"
          value={formatPrice(earningData.pendingPayout)}
          icon={<Wallet size={24} className="text-orange-600" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card title="Earning Overview" className="lg:col-span-2">
          <div className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart placeholder - integrate with recharts</p>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card title="Summary">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Gross Sales</span>
              <span className="font-medium">{formatPrice(9500000)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Refunds</span>
              <span className="font-medium text-red-600">-{formatPrice(450000)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Fees</span>
              <span className="font-medium text-red-600">-{formatPrice(600000)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-medium">Net Earning</span>
              <span className="font-bold text-lg">{formatPrice(earningData.thisMonth)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card
        title="Recent Transactions"
        headerAction={
          <button className="text-sm text-blue-600 hover:underline">View all</button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.amount > 0 ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowUpRight size={16} className="text-green-600" />
                        ) : (
                          <ArrowDownRight size={16} className="text-red-600" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        tx.type === "sale"
                          ? "bg-green-100 text-green-700"
                          : tx.type === "refund"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-medium ${
                        tx.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatPrice(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
