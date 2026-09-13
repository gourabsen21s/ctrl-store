"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { money } from "@/lib/products";
import { WalletWidget } from "@/components/WalletWidget";
import { useBag } from "@/components/providers/BagProvider";
import InvoiceModal from "@/components/InvoiceModal";

export default function AccountPage() {
  const router = useRouter();
  const { add } = useBag();

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [walletData, setWalletData] = useState<{ wallet: any; transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab state: "orders" | "address" | "wallet"
  const [activeTab, setActiveTab] = useState<"orders" | "address" | "wallet">("orders");

  // Address form state
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressSavedMessage, setAddressSavedMessage] = useState(false);

  // Invoice modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, ordersRes, walletRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/auth/orders"),
          fetch("/api/wallet"),
        ]);

        if (!meRes.ok || !ordersRes.ok) throw new Error("Not logged in");

        const meData = await meRes.json();
        if (!meData.user) throw new Error("Not logged in");

        const ordersData = await ordersRes.json();
        let walletResData = null;
        if (walletRes.ok) {
          walletResData = await walletRes.json();
        }

        setUser(meData.user);
        setOrders(ordersData.orders || []);
        if (walletResData) setWalletData(walletResData);

        // Pre-populate address form
        setPhone(meData.user.phone || "");
        if (meData.user.defaultAddress) {
          setStreet(meData.user.defaultAddress.street || "");
          setCity(meData.user.defaultAddress.city || "");
          setState(meData.user.defaultAddress.state || "");
          setPostalCode(meData.user.defaultAddress.postalCode || "");
        }
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

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressSavedMessage(false);

    try {
      const res = await fetch("/api/customer/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          street,
          city,
          state,
          postalCode,
          country: "India",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser((prev: any) => ({
          ...prev,
          phone: data.user.phone,
          defaultAddress: data.user.defaultAddress,
        }));
        setAddressSavedMessage(true);
        setTimeout(() => setAddressSavedMessage(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item: any) => {
      add(
        {
          handle: item.productHandle,
          title: item.productTitle,
          price: item.price,
          size: item.size,
          qty: item.qty || 1,
          image: item.image || "",
        },
        true
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Loading Customer Account...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto mt-28 mb-32 max-w-7xl px-4 lg:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-current/20 pb-8">
        <div>
          <h1 className="text-[8vw] leading-[0.8] font-[900] tracking-tighter md:text-6xl uppercase">
            My Account
          </h1>
          <p className="mt-4 font-mono text-sm tracking-widest opacity-60">
            WELCOME BACK, {user.name.toUpperCase()}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-current px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white dark:text-black transition-transform hover:scale-[1.02] active:scale-95"
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-current/20 mb-10 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`pb-4 px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === "orders"
              ? "border-b-2 border-current opacity-100"
              : "opacity-40 hover:opacity-100"
          }`}
        >
          Orders &amp; Receipts ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("address")}
          className={`pb-4 px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === "address"
              ? "border-b-2 border-current opacity-100"
              : "opacity-40 hover:opacity-100"
          }`}
        >
          Saved Delivery Address
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("wallet")}
          className={`pb-4 px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === "wallet"
              ? "border-b-2 border-current opacity-100"
              : "opacity-40 hover:opacity-100"
          }`}
        >
          CTRL+ Wallet &amp; Rewards
        </button>
      </div>

      {/* TAB 1: ORDERS & TRACKING */}
      {activeTab === "orders" && (
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold uppercase tracking-tight border-b border-current/10 pb-4">
              Order History &amp; Live Tracking
            </h2>

            {orders.length === 0 ? (
              <div className="border border-current/20 bg-current/5 p-8 text-center space-y-4">
                <p className="font-mono text-xs uppercase tracking-widest opacity-60">
                  You haven&apos;t placed any orders yet.
                </p>
                <Link
                  href="/store"
                  className="inline-block border border-current px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest hover:bg-current hover:text-white dark:hover:text-black transition-colors"
                >
                  Explore Store Catalog →
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="border border-current/20 bg-current/[0.03] p-6 sm:p-8"
                  >
                    {/* Order header row */}
                    <div className="flex flex-wrap gap-4 justify-between border-b border-current/10 pb-6 mb-6">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
                          Order Number
                        </div>
                        <div className="font-bold font-mono">{order.orderId}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
                          Date Placed
                        </div>
                        <div className="font-bold text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
                          Total Amount
                        </div>
                        <div className="font-bold font-mono">{money(order.pricing.total)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
                          Status
                        </div>
                        <div
                          className={`font-bold font-mono uppercase text-[10px] px-2.5 py-1 inline-block ${
                            order.fulfillment.status === "dispatched"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : order.fulfillment.status === "delivered"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : order.fulfillment.status === "packed"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-white/10 text-white/80 border border-white/20"
                          }`}
                        >
                          {order.fulfillment.status}
                        </div>
                      </div>
                    </div>

                    {/* Order items list */}
                    <div className="space-y-4">
                      {order.items.map((item: any) => (
                        <div
                          key={`${item.productHandle}-${item.size}`}
                          className="flex items-center gap-4"
                        >
                          <div className="relative h-20 w-16 shrink-0 bg-current/5 border border-current/10 overflow-hidden">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.productTitle}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-center">
                            <div className="font-bold text-sm">{item.productTitle}</div>
                            <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1">
                              Size: {item.size} • Color: {item.color || "Standard"} • Qty:{" "}
                              {item.qty}
                            </div>
                            <div className="font-mono text-xs font-bold mt-1">
                              {money(item.price * item.qty)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order action booster bar */}
                    <div className="mt-8 pt-6 border-t border-current/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/order/${order.orderId}`}
                          className="inline-flex items-center gap-1.5 bg-current text-white dark:text-black px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                        >
                          <span>Live Timeline Tracking ↗</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="border border-current/30 px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest hover:bg-current/10 transition-colors"
                        >
                          Reorder Items ↻
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="text-xs font-mono underline underline-offset-4 opacity-70 hover:opacity-100"
                      >
                        📄 Download / Print Tax Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <h2 className="mb-6 text-2xl font-bold uppercase tracking-tight border-b border-current/10 pb-4">
              Membership &amp; Wallet
            </h2>
            <div className="mb-8">
              <WalletWidget />
            </div>

            <div className="border border-current/20 p-6 font-mono text-sm uppercase tracking-widest space-y-4">
              <div>
                <span className="opacity-60 block text-[10px] mb-0.5">Primary Contact</span>
                <strong className="block text-sm">{user.name}</strong>
                <span className="text-xs lowercase opacity-70 block">{user.email}</span>
                {user.phone && <span className="text-xs opacity-70 block">{user.phone}</span>}
              </div>

              {user.defaultAddress?.street && (
                <div className="pt-3 border-t border-current/10">
                  <span className="opacity-60 block text-[10px] mb-0.5">
                    Saved Default Address
                  </span>
                  <p className="text-xs normal-case opacity-80 leading-relaxed">
                    {user.defaultAddress.street}, {user.defaultAddress.city},{" "}
                    {user.defaultAddress.state} {user.defaultAddress.postalCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAVED ADDRESS */}
      {activeTab === "address" && (
        <div className="max-w-2xl border border-current/20 bg-current/[0.03] p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Saved Delivery Address</h2>
            <p className="text-xs font-mono opacity-60 mt-1">
              Your default delivery address is auto-applied at checkout for 1-click purchases.
            </p>
          </div>

          {addressSavedMessage && (
            <div className="border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-500 font-bold">
              ✓ Shipping address updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase opacity-70 mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border border-current/30 bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-current"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase opacity-70 mb-1">
                Street Address / Apartment *
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="108 Brigade Road, 4th Floor"
                className="w-full border border-current/30 bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-current"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase opacity-70 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full border border-current/30 bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-current"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase opacity-70 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Karnataka"
                  className="w-full border border-current/30 bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-current"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase opacity-70 mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="560038"
                  className="w-full border border-current/30 bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-current"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addressSaving}
              className="bg-current text-white dark:text-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 mt-4"
            >
              {addressSaving ? "Saving Address..." : "Save Default Address"}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: WALLET & COIN LEDGER */}
      {activeTab === "wallet" && (
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">
                Coin Ledger &amp; Transaction History
              </h2>
              <p className="text-xs font-mono opacity-60">
                1 CTRL+ Coin = ₹1 discount on any future checkout.
              </p>
            </div>

            {walletData?.transactions?.length ? (
              <div className="border border-current/20 overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-current/5 border-b border-current/10 uppercase opacity-60">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Activity</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/10">
                    {walletData.transactions.map((tx: any) => (
                      <tr key={tx._id} className="hover:bg-current/[0.02] transition-colors">
                        <td className="py-3 px-4 opacity-60">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-bold capitalize">
                          {tx.reason.replace(/_/g, " ")}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            tx.type === "credit" ? "text-emerald-500" : "text-red-500"
                          }`}
                        >
                          {tx.type === "credit" ? `+${tx.amount}` : `-${tx.amount}`}
                        </td>
                        <td className="py-3 px-4 text-right opacity-80">{tx.balanceAfter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-current/20 p-8 text-center font-mono text-xs opacity-60">
                No coin transactions recorded yet. Share your referral code to start earning coins!
              </div>
            )}
          </div>

          <div>
            <WalletWidget />
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          isOpen={Boolean(selectedInvoiceOrder)}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
