"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/products";
import { createPortal } from "react-dom";

export default function SizeGuideModal({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (product.sizes.length === 1 && product.sizes[0] === "One size") {
    return null; // No size guide needed for one-size items
  }

  const modal = (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 transition-opacity ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setOpen(false)}
    >
      <div
        className={`relative w-full max-w-2xl bg-[#ede4dd] text-black dark:bg-[#0a0a0a] dark:text-[#ede4dd] p-8 md:p-12 my-8 md:my-16 transition-transform duration-300 ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-6 right-6 text-2xl leading-none hover:opacity-60 transition-opacity"
        >
          ×
        </button>
        
        <h2 className="mb-2 text-3xl font-[900] tracking-tighter uppercase">Size Guide</h2>
        <p className="mb-8 font-mono text-sm opacity-60">Measurements are in Centimeters (CM). Garments are measured flat.</p>

        <div className="overflow-x-auto border border-current/20">
          <table className="w-full text-left font-mono text-xs uppercase tracking-widest">
            <thead className="bg-current/5">
              <tr>
                <th className="p-4 font-bold border-b border-current/20 border-r">Size</th>
                <th className="p-4 font-bold border-b border-current/20 border-r">Chest</th>
                <th className="p-4 font-bold border-b border-current/20 border-r">Shoulder</th>
                <th className="p-4 font-bold border-b border-current/20 border-r">Length</th>
                <th className="p-4 font-bold border-b border-current/20">Sleeve</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-current/20">
                <td className="p-4 border-r border-current/20 font-bold">S</td>
                <td className="p-4 border-r border-current/20">56</td>
                <td className="p-4 border-r border-current/20">50</td>
                <td className="p-4 border-r border-current/20">71</td>
                <td className="p-4">22</td>
              </tr>
              <tr className="border-b border-current/20">
                <td className="p-4 border-r border-current/20 font-bold">M</td>
                <td className="p-4 border-r border-current/20">58</td>
                <td className="p-4 border-r border-current/20">52</td>
                <td className="p-4 border-r border-current/20">73</td>
                <td className="p-4">23</td>
              </tr>
              <tr className="border-b border-current/20">
                <td className="p-4 border-r border-current/20 font-bold">L</td>
                <td className="p-4 border-r border-current/20">60</td>
                <td className="p-4 border-r border-current/20">54</td>
                <td className="p-4 border-r border-current/20">75</td>
                <td className="p-4">24</td>
              </tr>
              <tr className="border-b border-current/20">
                <td className="p-4 border-r border-current/20 font-bold">XL</td>
                <td className="p-4 border-r border-current/20">63</td>
                <td className="p-4 border-r border-current/20">56</td>
                <td className="p-4 border-r border-current/20">77</td>
                <td className="p-4">25</td>
              </tr>
              <tr>
                <td className="p-4 border-r border-current/20 font-bold">2XL</td>
                <td className="p-4 border-r border-current/20">66</td>
                <td className="p-4 border-r border-current/20">58</td>
                <td className="p-4 border-r border-current/20">79</td>
                <td className="p-4">26</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 border-l-2 border-current pl-4">
          <h3 className="font-bold uppercase tracking-widest text-sm mb-2">Fit Recommendation</h3>
          <p className="font-mono text-xs opacity-70">
            {product.category === "Apparel" 
              ? "This garment is designed with a boxy, dropped-shoulder fit. Take your normal size for the intended drape, or size down for a more standard fit." 
              : "Standard fit."}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        type="button" 
        onClick={() => setOpen(true)}
        className="text-[10px] uppercase font-mono tracking-widest underline underline-offset-4 hover:opacity-60 transition-opacity"
      >
        Size Guide
      </button>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
