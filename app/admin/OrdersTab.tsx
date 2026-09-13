"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/products";
import Link from "next/link";
import InvoiceModal from "@/components/InvoiceModal";

export default function OrdersTab({ showNotification }: { showNotification: (msg: string, type?: "success"|"error") => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("All");
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async (page = currentPage, status = statusFilter, fulfillment = fulfillmentFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(status !== "All" && { status }),
        ...(fulfillment !== "All" && { fulfillment }),
      });
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err: any) {
      showNotification(err.message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, fulfillmentFilter]);

  const openOrder = (order: any) => {
    setSelectedOrder(order);
    setDispatchStatus(order.fulfillment.status);
    setCourierName(order.fulfillment.courierName || "");
    setTrackingNumber(order.fulfillment.trackingNumber || "");
    setTrackingUrl(order.fulfillment.trackingUrl || "");
    setIsModalOpen(true);
  };

  const handleUpdateFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const payload = {
        status: dispatchStatus,
        courierName,
        trackingNumber,
        trackingUrl,
      };
      const res = await fetch(`/api/admin/orders/${selectedOrder.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update order");
      showNotification(`Order #${selectedOrder.orderId} updated to ${dispatchStatus}`);
      setIsModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 border border-white/10 p-1 bg-[#141414]">
          {["All", "paid", "failed", "pending"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setStatusFilter(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                statusFilter === cat ? "bg-white text-black font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              {cat === "All" ? "All Payments" : cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border border-white/10 p-1 bg-[#141414] overflow-x-auto">
          {["All", "processing", "packed", "dispatched", "delivered", "cancelled"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFulfillmentFilter(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                fulfillmentFilter === cat ? "bg-white text-black font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              {cat === "All" ? "All Fulfillment" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border border-white/10 bg-[#121212]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-white/10 bg-black/40 text-white/50 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Order ID</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Amount</th>
              <th className="px-4 py-3.5">Payment</th>
              <th className="px-4 py-3.5">Fulfillment</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/40">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/40">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.orderId} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-4 whitespace-nowrap font-bold text-white">{order.orderId}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{order.customer.name}</div>
                    <div className="text-white/50">{order.customer.email}</div>
                  </td>
                  <td className="px-4 py-4">{money(order.pricing.total)}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 uppercase text-[10px] font-bold ${
                      order.payment.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
                      order.payment.status === 'failed' ? 'bg-red/20 text-red' : 'bg-white/10 text-white'
                    }`}>
                      {order.payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 uppercase text-[10px] font-bold ${
                      order.fulfillment.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                      order.fulfillment.status === 'dispatched' ? 'bg-purple-500/20 text-purple-400' :
                      order.fulfillment.status === 'packed' ? 'bg-blue-500/20 text-blue-400' :
                      order.fulfillment.status === 'cancelled' ? 'bg-red/20 text-red' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {order.fulfillment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white/50">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <Link
                      href={`/order/${order.orderId}`}
                      target="_blank"
                      className="border border-white/20 px-2.5 py-1.5 uppercase text-[10px] text-white/70 hover:text-white hover:border-white transition-colors mr-2 inline-block"
                    >
                      Track ↗
                    </Link>
                    <button
                      onClick={() => openOrder(order)}
                      className="border border-white/20 px-3 py-1.5 uppercase text-[10px] hover:bg-white hover:text-black transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 font-mono text-xs">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-white/20 disabled:opacity-30 hover:bg-white/10"
          >
            Prev
          </button>
          <span className="px-3 py-1.5">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-white/20 disabled:opacity-30 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20 bg-[#0a0a0a] shadow-2xl flex flex-col md:flex-row">
            {/* Left side: Order Details */}
            <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-white/10 font-mono text-xs text-white/70">
              <h2 className="text-xl font-sans font-[900] tracking-tighter uppercase text-white mb-6">
                Order {selectedOrder.orderId}
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <strong className="text-white uppercase tracking-wider block mb-1">Customer</strong>
                  {selectedOrder.customer.name}<br />
                  {selectedOrder.customer.email}<br />
                  {selectedOrder.customer.phone}
                </div>
                <div>
                  <strong className="text-white uppercase tracking-wider block mb-1">Shipping Address</strong>
                  {selectedOrder.shippingAddress.street}<br />
                  {selectedOrder.shippingAddress.landmark && <>{selectedOrder.shippingAddress.landmark}<br /></>}
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                  {selectedOrder.shippingAddress.country}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <strong className="text-white uppercase tracking-wider block mb-3">Items</strong>
                <ul className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <li key={`${item.productHandle}-${item.size}`} className="flex justify-between">
                      <div>
                        <div className="text-white">{item.productTitle}</div>
                        <div className="opacity-50 uppercase">{item.size} · {item.color} · Qty {item.qty}</div>
                      </div>
                      <div>{money(item.price * item.qty)}</div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
                  <span className="uppercase opacity-60">Subtotal</span>
                  <span>{money(selectedOrder.pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="uppercase opacity-60">Shipping</span>
                  <span>{selectedOrder.pricing.shippingFee === 0 ? "FREE" : money(selectedOrder.pricing.shippingFee)}</span>
                </div>
                <div className="flex justify-between mt-2 text-white font-bold text-sm">
                  <span className="uppercase">Total</span>
                  <span>{money(selectedOrder.pricing.total)}</span>
                </div>
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="p-6 md:w-1/2 flex flex-col font-mono text-xs">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base uppercase tracking-widest text-white font-bold">Fulfillment</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <a
                      href={`/order/${selectedOrder.orderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline inline-block"
                    >
                      View Live Tracking Page ↗
                    </a>
                    <span className="text-white/20">•</span>
                    <button
                      type="button"
                      onClick={() => setIsInvoiceOpen(true)}
                      className="text-[11px] text-blue-400 hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>📄 Print Tax Invoice</span>
                    </button>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white uppercase tracking-wider">Close ✕</button>
              </div>

              <form onSubmit={handleUpdateFulfillment} className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Status</label>
                    <select
                      value={dispatchStatus}
                      onChange={(e) => setDispatchStatus(e.target.value)}
                      className="w-full border border-white/20 bg-black px-3 py-2 text-white focus:border-white focus:outline-none"
                    >
                      <option value="processing">Processing (Order Confirmed)</option>
                      <option value="packed">Packed (Quality Checked & Ready)</option>
                      <option value="dispatched">Dispatched (In Transit)</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {dispatchStatus === "dispatched" && (
                    <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Courier Name</label>
                        <input
                          type="text"
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          placeholder="e.g. BlueDart, Delhivery"
                          className="w-full border border-white/20 bg-black px-3 py-2 text-white focus:border-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="e.g. 1234567890"
                          className="w-full border border-white/20 bg-black px-3 py-2 text-white focus:border-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Tracking URL</label>
                        <input
                          type="url"
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full border border-white/20 bg-black px-3 py-2 text-white focus:border-white focus:outline-none"
                        />
                      </div>
                      <p className="text-emerald-400/80 text-[10px]">
                        Note: Updating to "Dispatched" will automatically email the customer their tracking details.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-white text-black py-3 uppercase tracking-wider font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}
    </div>
  );
}
