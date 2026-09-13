"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { money } from "@/lib/products";
import { WalletWidget } from "@/components/WalletWidget";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/auth/orders")
        ]);

        if (!meRes.ok || !ordersRes.ok) throw new Error("Not logged in");
        
        const meData = await meRes.json();
        if (!meData.user) throw new Error("Not logged in");
        
        const ordersData = await ordersRes.json();

        setUser(meData.user);
        setOrders(ordersData.orders || []);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest">Loading Account...</div>;
  }

  if (!user) return null;

  return (
    <div className="mx-auto mt-28 mb-32 max-w-7xl px-4 lg:px-6">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-current/20 pb-8">
        <div>
          <h1 className="text-[8vw] leading-[0.8] font-[900] tracking-tighter md:text-6xl uppercase">My Account</h1>
          <p className="mt-4 font-mono text-sm tracking-widest opacity-60">WELCOME BACK, {user.name.toUpperCase()}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-current px-6 py-3 text-xs font-bold uppercase tracking-widest text-white dark:text-black transition-transform hover:scale-[1.02] active:scale-95"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-16 lg:grid-cols-3">
        {/* Orders Section */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold uppercase tracking-tight border-b border-current/10 pb-4">Order History</h2>
          
          {orders.length === 0 ? (
            <div className="border border-current/20 bg-current/5 p-8 text-center">
              <p className="font-mono text-xs uppercase tracking-widest opacity-60 mb-4">You haven't placed any orders yet.</p>
              <Link href="/" className="inline-block border border-current px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-current hover:text-white dark:hover:text-black transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map(order => (
                <div key={order.orderId} className="border border-current/20 bg-current/5 p-6 sm:p-8">
                  <div className="flex flex-wrap gap-4 justify-between border-b border-current/10 pb-6 mb-6">
                    <div>
                      <div className="font-mono text-xs uppercase tracking-widest opacity-60 mb-1">Order ID</div>
                      <div className="font-bold">{order.orderId}</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-widest opacity-60 mb-1">Date</div>
                      <div className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs uppercase tracking-widest opacity-60 mb-1">Total</div>
                      <div className="font-bold">{money(order.pricing.total)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs uppercase tracking-widest opacity-60 mb-1">Status</div>
                      <div className={`font-bold uppercase text-[10px] px-2 py-1 ${
                        order.fulfillment.status === 'dispatched' ? 'bg-blue-500/20 text-blue-500' :
                        order.fulfillment.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-500' :
                        order.fulfillment.status === 'cancelled' ? 'bg-red/20 text-red' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {order.fulfillment.status}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={`${item.productHandle}-${item.size}`} className="flex gap-4">
                        <div className="relative h-20 w-16 shrink-0">
                          {item.image && <Image src={item.image} alt={item.productTitle} fill className="object-cover" />}
                        </div>
                        <div className="flex flex-1 flex-col justify-center">
                          <div className="font-bold">{item.productTitle}</div>
                          <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1">
                            {item.size} · {item.color} · QTY {item.qty}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {order.fulfillment.trackingUrl && (
                    <div className="mt-8 pt-6 border-t border-current/10">
                      <a href={order.fulfillment.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-current text-white dark:text-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
                        Track Package ↗
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Details Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold uppercase tracking-tight border-b border-current/10 pb-4">Profile & Wallet</h2>
          
          <div className="mb-8">
            <WalletWidget />
          </div>

          <div className="border border-current/20 p-6 font-mono text-sm uppercase tracking-widest">
            <div className="mb-4">
              <span className="opacity-60 block text-xs mb-1">Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="mb-4">
              <span className="opacity-60 block text-xs mb-1">Email</span>
              <strong>{user.email}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
