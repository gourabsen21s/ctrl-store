"use client";

import { useState, useEffect } from "react";
import { money } from "@/lib/products";

export default function WalletsTab({ showNotification }: { showNotification: (text: string, type?: "success" | "error") => void }) {
  const [wallets, setWallets] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [kpis, setKpis] = useState({ totalCoinsInCirculation: 0, totalLifetimeEarned: 0 });
  const [subTab, setSubTab] = useState<"wallets" | "referrals" | "settings">("wallets");

  // Wallet detail modal
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [walletDetail, setWalletDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Credit/Debit form
  const [actionAmount, setActionAmount] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [actionType, setActionType] = useState<"credit" | "debit">("credit");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [subTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (subTab === "wallets") {
        const res = await fetch("/api/admin/wallets");
        const data = await res.json();
        setWallets(data.wallets || []);
        setKpis(data.kpis || { totalCoinsInCirculation: 0, totalLifetimeEarned: 0 });
      } else if (subTab === "referrals") {
        const res = await fetch("/api/admin/referrals");
        const data = await res.json();
        setReferrals(data.referrals || []);
      } else if (subTab === "settings") {
        const res = await fetch("/api/admin/settings/rewards");
        const data = await res.json();
        setSettings(data.walletSettings);
      }
    } catch (err) {
      showNotification("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletDetail = async (customerId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/wallets/${customerId}`);
      const data = await res.json();
      setWalletDetail(data);
    } catch (err) {
      showNotification("Failed to fetch wallet detail", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleWalletClick = (wallet: any) => {
    setSelectedWallet(wallet);
    fetchWalletDetail(wallet.customerId._id);
  };

  const closeWalletDetail = () => {
    setSelectedWallet(null);
    setWalletDetail(null);
    setActionAmount("");
    setActionReason("");
  };

  const handleManualAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionAmount || !actionReason) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/wallets/${walletDetail.customer._id}/${actionType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(actionAmount), note: actionReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      
      showNotification(`Successfully ${actionType}ed ${actionAmount} coins`);
      setActionAmount("");
      setActionReason("");
      fetchWalletDetail(walletDetail.customer._id);
      fetchData(); // refresh main list
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      showNotification("Settings saved successfully");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-widest text-white">CTRL+ Coins</h2>
          <p className="mt-2 font-mono text-xs text-white/50">Manage wallets, referrals, and rewards</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setSubTab("wallets")}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${subTab === "wallets" ? "bg-white text-black" : "border border-white/20 text-white hover:bg-white/10"}`}
        >
          Customer Wallets
        </button>
        <button
          onClick={() => setSubTab("referrals")}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${subTab === "referrals" ? "bg-white text-black" : "border border-white/20 text-white hover:bg-white/10"}`}
        >
          Referrals
        </button>
        <button
          onClick={() => setSubTab("settings")}
          className={`px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors ${subTab === "settings" ? "bg-white text-black" : "border border-white/20 text-white hover:bg-white/10"}`}
        >
          Reward Settings
        </button>
      </div>

      {loading && !selectedWallet ? (
        <div className="text-center font-mono text-sm opacity-50 py-12">Loading...</div>
      ) : (
        <>
          {subTab === "wallets" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-white/10 bg-[#141414] p-6">
                  <div className="text-xs uppercase opacity-50 font-mono mb-2">Total Coins in Circulation</div>
                  <div className="text-4xl font-bold">{kpis.totalCoinsInCirculation}</div>
                  <div className="text-xs font-mono opacity-50 mt-2">({money(kpis.totalCoinsInCirculation)} liability)</div>
                </div>
                <div className="border border-white/10 bg-[#141414] p-6">
                  <div className="text-xs uppercase opacity-50 font-mono mb-2">Total Lifetime Awarded</div>
                  <div className="text-4xl font-bold">{kpis.totalLifetimeEarned}</div>
                </div>
              </div>

              <table className="w-full text-left font-mono text-xs text-white">
                <thead className="bg-[#141414] uppercase text-white/50">
                  <tr>
                    <th className="p-4 font-normal">Customer</th>
                    <th className="p-4 font-normal">Email</th>
                    <th className="p-4 font-normal">Balance</th>
                    <th className="p-4 font-normal">Lifetime Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {wallets.map((w) => (
                    <tr key={w._id} onClick={() => handleWalletClick(w)} className="hover:bg-white/5 cursor-pointer transition-colors">
                      <td className="p-4 font-bold">{w.customerId?.name || "Unknown"}</td>
                      <td className="p-4">{w.customerId?.email}</td>
                      <td className="p-4 font-bold text-emerald-400">{w.balance}</td>
                      <td className="p-4 opacity-50">{w.lifetimeEarned}</td>
                    </tr>
                  ))}
                  {wallets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center opacity-50">No wallets found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {subTab === "referrals" && (
            <div className="space-y-6">
              <table className="w-full text-left font-mono text-xs text-white">
                <thead className="bg-[#141414] uppercase text-white/50">
                  <tr>
                    <th className="p-4 font-normal">Date</th>
                    <th className="p-4 font-normal">Referrer</th>
                    <th className="p-4 font-normal">Referee (New User)</th>
                    <th className="p-4 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {referrals.map((r) => (
                    <tr key={r._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 opacity-50">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-bold">{r.referrerId?.name || "Unknown"} <br/><span className="text-[10px] opacity-50 font-normal">{r.referrerId?.email}</span></td>
                      <td className="p-4">{r.refereeId?.name || "Unknown"} <br/><span className="text-[10px] opacity-50">{r.refereeId?.email}</span></td>
                      <td className="p-4">
                        <span className={`px-2 py-1 uppercase text-[10px] font-bold ${r.status === 'rewarded' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {referrals.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center opacity-50">No referrals found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {subTab === "settings" && settings && (
            <form onSubmit={saveSettings} className="space-y-8 max-w-2xl border border-white/10 bg-[#141414] p-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase opacity-50 font-mono mb-2">Referrer Reward (Coins)</label>
                  <input type="number" value={settings.referrerReward} onChange={e => setSettings({...settings, referrerReward: e.target.value})} className="w-full bg-transparent border border-white/20 p-3 outline-none focus:border-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase opacity-50 font-mono mb-2">Referee Reward (Coins)</label>
                  <input type="number" value={settings.refereeReward} onChange={e => setSettings({...settings, refereeReward: e.target.value})} className="w-full bg-transparent border border-white/20 p-3 outline-none focus:border-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase opacity-50 font-mono mb-2">Signup Bonus (No Referral)</label>
                  <input type="number" value={settings.signupBonus} onChange={e => setSettings({...settings, signupBonus: e.target.value})} className="w-full bg-transparent border border-white/20 p-3 outline-none focus:border-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase opacity-50 font-mono mb-2">Max Redemption % Per Order</label>
                  <input type="number" max="100" value={settings.maxRedemptionPercentage} onChange={e => setSettings({...settings, maxRedemptionPercentage: e.target.value})} className="w-full bg-transparent border border-white/20 p-3 outline-none focus:border-white font-mono text-sm" />
                </div>
              </div>
              <button type="submit" className="bg-white text-black px-6 py-3 text-sm font-bold uppercase tracking-widest hover:opacity-80">
                Save Settings
              </button>
            </form>
          )}
        </>
      )}

      {/* Wallet Detail Modal */}
      {selectedWallet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#111] border border-white/20 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-white">Wallet Details</h3>
              <button onClick={closeWalletDetail} className="text-white hover:opacity-50 text-2xl font-mono">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {detailLoading || !walletDetail ? (
                <div className="text-center font-mono text-sm opacity-50 py-12">Loading detail...</div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center bg-[#1a1a1a] p-6 border border-white/10">
                    <div>
                      <div className="font-bold text-xl uppercase">{walletDetail.customer.name}</div>
                      <div className="font-mono text-xs opacity-50">{walletDetail.customer.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-[900] text-emerald-400">{walletDetail.wallet.balance} Coins</div>
                      <div className="font-mono text-xs opacity-50 mt-1">Version: {walletDetail.wallet.version}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Transaction History */}
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Transaction Ledger</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {walletDetail.transactions.map((tx: any) => (
                          <div key={tx._id} className="bg-[#1a1a1a] p-3 border border-white/5 font-mono text-xs">
                            <div className="flex justify-between font-bold mb-1">
                              <span className={tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}>
                                {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                              </span>
                              <span className="opacity-50">{new Date(tx.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="uppercase opacity-80 mb-1">{tx.reason.replace(/_/g, ' ')}</div>
                            <div className="flex justify-between text-[10px] opacity-40">
                              <span>Ref: {tx.referenceId}</span>
                              <span>Bal: {tx.balanceAfter}</span>
                            </div>
                            {tx.note && <div className="mt-2 pt-2 border-t border-white/10 text-amber-500/80">Note: {tx.note}</div>}
                          </div>
                        ))}
                        {walletDetail.transactions.length === 0 && (
                          <div className="text-center opacity-50 py-4">No transactions</div>
                        )}
                      </div>
                    </div>

                    {/* Manual Action Form */}
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Manual Adjustments</h4>
                      <form onSubmit={handleManualAction} className="bg-[#1a1a1a] p-6 border border-white/10 space-y-4">
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={actionType === 'credit'} onChange={() => setActionType('credit')} name="actionType" />
                            <span className="font-mono text-xs uppercase font-bold text-emerald-400">Credit (+)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={actionType === 'debit'} onChange={() => setActionType('debit')} name="actionType" />
                            <span className="font-mono text-xs uppercase font-bold text-red-400">Debit (-)</span>
                          </label>
                        </div>
                        
                        <div>
                          <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Amount</label>
                          <input required type="number" min="1" value={actionAmount} onChange={e => setActionAmount(e.target.value)} className="w-full bg-transparent border border-white/20 p-3 text-sm font-mono outline-none focus:border-white" />
                        </div>
                        
                        <div>
                          <label className="block font-mono text-[10px] uppercase opacity-50 mb-1">Reason / Note</label>
                          <input required type="text" value={actionReason} onChange={e => setActionReason(e.target.value)} placeholder="E.g. Refund for damaged item" className="w-full bg-transparent border border-white/20 p-3 text-sm font-mono outline-none focus:border-white" />
                        </div>
                        
                        <button disabled={actionLoading} type="submit" className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/90 disabled:opacity-50">
                          {actionLoading ? "Processing..." : `Execute ${actionType}`}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
