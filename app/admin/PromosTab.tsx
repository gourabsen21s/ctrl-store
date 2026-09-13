"use client";

import { useEffect, useState } from "react";

export default function PromosTab({ showNotification }: { showNotification: (msg: string, type?: "success"|"error") => void }) {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promos");
      if (!res.ok) throw new Error("Failed to load promos");
      const json = await res.json();
      if (json.success) {
        setPromos(json.promos);
      }
    } catch (err: any) {
      showNotification(err.message || "Failed to load promos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) {
      showNotification("Code and Value are required", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        usageLimit: usageLimit ? Number(usageLimit) : 0,
      };

      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create promo");
      
      showNotification("Promo created successfully!");
      setIsModalOpen(false);
      setCode("");
      setDiscountValue("");
      setUsageLimit("");
      fetchPromos();
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setPromos(promos.map(p => p._id === id ? { ...p, active: !currentStatus } : p));
      showNotification(`Promo ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this promo code?")) return;
    try {
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete promo");
      
      setPromos(promos.filter(p => p._id !== id));
      showNotification("Promo deleted");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-white px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 active:scale-95"
        >
          + Add Promo Code
        </button>
      </div>

      <div className="overflow-x-auto border border-white/10 bg-[#121212]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-white/10 bg-black/40 text-white/50 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Code</th>
              <th className="px-4 py-3.5">Discount</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Usage</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/40">Loading promos...</td>
              </tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/40">No active promos.</td>
              </tr>
            ) : (
              promos.map((promo) => (
                <tr key={promo._id} className={`hover:bg-white/5 transition-colors ${!promo.active && 'opacity-50'}`}>
                  <td className="px-4 py-4 whitespace-nowrap font-bold text-white tracking-widest">{promo.code}</td>
                  <td className="px-4 py-4 text-emerald-400">
                    {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={() => toggleActive(promo._id, promo.active)}
                      className={`px-2 py-1 uppercase text-[10px] font-bold ${
                        promo.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red/20 text-red'
                      }`}
                    >
                      {promo.active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-white/50">
                    {promo.usageCount} / {promo.usageLimit === 0 ? '∞' : promo.usageLimit}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="border border-white/20 px-3 py-1.5 uppercase text-[10px] hover:bg-red hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-white/20 bg-[#0a0a0a] shadow-2xl p-6 font-mono text-xs">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-sans font-[900] tracking-tighter uppercase text-white">
                New Promo Code
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white uppercase tracking-wider">Close ✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER25"
                  className="w-full border border-white/20 bg-black px-3 py-2 text-white focus:border-white focus:outline-none uppercase"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full border border-white/20 bg-black px-3 py-2 text-white focus:border-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? "20" : "500"}
                    className="w-full border border-white/20 bg-black px-3 py-2 text-white focus:border-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-1">Usage Limit (Optional)</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="0 for unlimited"
                  className="w-full border border-white/20 bg-black px-3 py-2 text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black py-3 uppercase tracking-wider font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
