"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Card from "@/components/admin/Card";

interface TaxRate {
  id: string;
  country: string;
  state: string;
  rate: number;
  name: string;
  taxClass: string;
  shipping: boolean;
}

const mockTaxRates: TaxRate[] = [
  { id: "1", country: "KR", state: "*", rate: 10, name: "부가가치세", taxClass: "standard", shipping: true },
];

export default function TaxSettingsPage() {
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);
  const [taxRates, setTaxRates] = useState<TaxRate[]>(mockTaxRates);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tax Settings</h1>

      {/* General Tax Options */}
      <Card title="Tax Options">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Taxes</p>
              <p className="text-sm text-gray-500">Enable tax rates and calculations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Prices Include Tax</p>
              <p className="text-sm text-gray-500">Enter prices inclusive of tax</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={pricesIncludeTax}
                onChange={(e) => setPricesIncludeTax(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Calculate Tax Based On</label>
            <select className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="shipping">Customer shipping address</option>
              <option value="billing">Customer billing address</option>
              <option value="base">Shop base address</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Prices in Shop</label>
            <select className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="incl">Including tax</option>
              <option value="excl">Excluding tax</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tax Classes */}
      <Card title="Tax Classes">
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Tax classes are used to apply different tax rates to different types of products.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Standard Rate</p>
                <p className="text-xs text-gray-500">Default tax class</p>
              </div>
              <span className="text-sm text-gray-400">Default</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Reduced Rate</p>
                <p className="text-xs text-gray-500">For reduced tax items</p>
              </div>
              <button className="text-sm text-red-500 hover:underline">Remove</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Zero Rate</p>
                <p className="text-xs text-gray-500">For tax-exempt items</p>
              </div>
              <button className="text-sm text-red-500 hover:underline">Remove</button>
            </div>
          </div>
          <button className="mt-4 text-sm text-blue-600 hover:underline">+ Add Tax Class</button>
        </div>
      </Card>

      {/* Tax Rates */}
      <Card
        title="Standard Rates"
        headerAction={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Plus size={16} />
            Add Rate
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Country</th>
                <th className="px-6 py-3 font-medium">State</th>
                <th className="px-6 py-3 font-medium">Rate %</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Shipping</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxRates.map((rate) => (
                <tr key={rate.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{rate.country}</td>
                  <td className="px-6 py-4 text-sm">{rate.state === "*" ? "All" : rate.state}</td>
                  <td className="px-6 py-4 text-sm font-medium">{rate.rate}%</td>
                  <td className="px-6 py-4 text-sm">{rate.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${rate.shipping ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {rate.shipping ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit size={16} className="text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Rate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Add Tax Rate</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country Code</label>
                  <input
                    type="text"
                    placeholder="KR"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State Code</label>
                  <input
                    type="text"
                    placeholder="* for all"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rate %</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Name</label>
                  <input
                    type="text"
                    placeholder="VAT"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="shipping" className="rounded" />
                <label htmlFor="shipping" className="text-sm">Apply to shipping</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Add Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
