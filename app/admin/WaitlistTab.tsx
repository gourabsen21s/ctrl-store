"use client";

import { useEffect, useState } from "react";

export default function WaitlistTab() {
  const [waitlists, setWaitlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/waitlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setWaitlists(data.waitlists || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-sm font-bold uppercase tracking-widest opacity-60">Loading Waitlist...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 text-sm font-bold uppercase tracking-widest">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Waitlist</h2>
        <div className="text-sm font-mono opacity-60 uppercase tracking-widest">
          {waitlists.length} Entries
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-mono uppercase tracking-widest">
          <thead className="bg-current/5">
            <tr>
              <th className="p-4 font-bold">Email</th>
              <th className="p-4 font-bold">Product</th>
              <th className="p-4 font-bold">Date Joined</th>
              <th className="p-4 font-bold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-current/10">
            {waitlists.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center opacity-60">
                  No one is on the waitlist right now.
                </td>
              </tr>
            ) : (
              waitlists.map((entry) => (
                <tr key={entry._id} className="hover:bg-current/5 transition-colors">
                  <td className="p-4">{entry.email}</td>
                  <td className="p-4">
                    <span className="font-bold">{entry.productTitle}</span>
                    <br />
                    <span className="text-[10px] opacity-60">{entry.productHandle}</span>
                  </td>
                  <td className="p-4">{new Date(entry.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    {entry.notified ? (
                      <span className="text-emerald-500 bg-emerald-500/20 px-2 py-1 text-[10px] font-bold">Notified</span>
                    ) : (
                      <span className="text-amber-500 bg-amber-500/20 px-2 py-1 text-[10px] font-bold">Waiting</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
