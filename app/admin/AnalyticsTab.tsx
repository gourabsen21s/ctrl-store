"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/products";

export default function AnalyticsTab({ showNotification }: { showNotification: (msg: string, type?: "success"|"error") => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err: any) {
        showNotification(err.message || "Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [showNotification]);

  if (loading) {
    return <div className="py-12 text-center text-white/40 font-mono text-xs">Loading analytics...</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-8 font-mono">
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-white/20 bg-[#121212] p-6 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-4">Gross Revenue</div>
          <div className="text-4xl font-bold text-white">{money(data.grossRevenue)}</div>
        </div>
        <div className="border border-white/20 bg-[#121212] p-6 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-4">Total Paid Orders</div>
          <div className="text-4xl font-bold text-white">{data.totalOrders}</div>
        </div>
        <div className="border border-white/20 bg-[#121212] p-6 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-4">Avg Order Value</div>
          <div className="text-4xl font-bold text-white">{money(data.averageOrderValue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="border border-white/20 bg-[#121212] p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Recent Orders</h2>
          {data.recentOrders?.length === 0 ? (
            <p className="text-white/40 text-xs">No recent orders.</p>
          ) : (
            <ul className="space-y-4">
              {data.recentOrders.map((order: any) => (
                <li key={order.orderId} className="flex justify-between items-center border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="text-white text-xs">{order.customer.name}</div>
                    <div className="text-[10px] text-white/50">#{order.orderId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-xs font-bold">{money(order.pricing.total)}</div>
                    <div className={`text-[9px] uppercase font-bold ${order.payment.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {order.payment.status}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="border border-white/20 bg-[#121212] p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Low Stock Alerts</h2>
          {data.lowStockProducts?.length === 0 ? (
            <p className="text-emerald-400 text-xs">All inventory levels are healthy.</p>
          ) : (
            <ul className="space-y-4">
              {data.lowStockProducts.map((product: any) => (
                <li key={product.handle} className="flex justify-between items-center border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="text-white text-xs">{product.title}</div>
                    <div className="text-[10px] text-white/50">SKU: {product.handle}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${product.stock === 0 ? 'text-red' : 'text-amber-400'}`}>
                      {product.stock}
                    </div>
                    <div className="text-[9px] uppercase text-white/50">Units Left</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
