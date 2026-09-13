"use client";

import { useEffect, useState } from "react";

export type ReviewItem = {
  _id: string;
  productHandle: string;
  productTitle: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
};

interface ProductReviewsProps {
  productHandle: string;
  productTitle: string;
}

export default function ProductReviews({ productHandle, productTitle }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [breakdown, setBreakdown] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?handle=${encodeURIComponent(productHandle)}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating ?? 5.0);
        setTotalReviews(data.totalReviews ?? 0);
        setBreakdown(data.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productHandle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productHandle,
          productTitle,
          author: author.trim() || "Verified Buyer",
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setSubmitSuccess(true);
      setAuthor("");
      setTitle("");
      setComment("");
      setRating(5);
      fetchReviews();

      setTimeout(() => {
        setIsFormOpen(false);
        setSubmitSuccess(false);
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting review";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-24 border-t border-current/30 pt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-red font-bold">
            VERIFIED FEEDBACK // COMMUNITY RATINGS
          </span>
          <h2 className="text-3xl sm:text-4xl font-[900] tracking-tight mt-1">
            Customer Reviews
          </h2>
        </div>

        <button
          type="button"
          data-cursor
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="border border-current px-6 py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-colors hover:bg-current hover:text-[var(--color-bg)] self-start sm:self-auto"
        >
          {isFormOpen ? "Cancel Review" : "Write a Review ↗"}
        </button>
      </div>

      {/* Aggregate Score & Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border border-current/20 p-6 sm:p-8 bg-current/[0.02] mb-12">
        {/* Big Score Card */}
        <div className="md:col-span-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-current/20 pb-6 md:pb-0 md:pr-8">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-[900] tracking-tighter">
              {totalReviews > 0 ? averageRating.toFixed(1) : "5.0"}
            </span>
            <span className="text-lg opacity-50 font-mono">/ 5.0</span>
          </div>

          <div className="flex items-center gap-1 text-amber-500 my-2 text-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.round(averageRating) ? "★" : "☆"}
              </span>
            ))}
          </div>

          <p className="text-xs font-mono opacity-60">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "verified customer reviews"}
          </p>
        </div>

        {/* Breakdown bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : star === 5 ? 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs font-mono">
                <span className="w-8 opacity-70 flex items-center gap-0.5">
                  <span>{star}</span>
                  <span className="text-amber-500">★</span>
                </span>
                <div className="flex-1 h-2 bg-current/10 overflow-hidden">
                  <div
                    className="h-full bg-current transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right opacity-50">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form Modal / Box */}
      {isFormOpen && (
        <div className="border border-current/30 p-6 sm:p-8 bg-current/[0.03] mb-12 animate-fade-in">
          <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
            Write Your Review for {productTitle}
          </h3>
          <p className="text-xs font-mono opacity-60 mb-6">
            Share your feedback on the fabric weight, drape, cut, and fit with fellow collectors.
          </p>

          {submitSuccess ? (
            <div className="border border-emerald-500/40 bg-emerald-500/10 p-6 text-emerald-400 font-mono text-xs">
              ✓ Thank you! Your review has been submitted and posted to the product page.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="border border-red/40 bg-red/10 p-3 text-red font-mono text-xs">
                  {submitError}
                </div>
              )}

              {/* Star Picker */}
              <div>
                <label className="block text-xs font-mono uppercase opacity-70 mb-1">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <span className={star <= (hoverRating || rating) ? "text-amber-500" : "opacity-30"}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-mono opacity-60">
                    {rating === 5 && "5 / 5 — Flawless Quality & Fit"}
                    {rating === 4 && "4 / 5 — Great Piece"}
                    {rating === 3 && "3 / 5 — Decent"}
                    {rating === 2 && "2 / 5 — Needs Improvement"}
                    {rating === 1 && "1 / 5 — Disappointed"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase opacity-70 mb-1">
                    Your Name / Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Kabir M."
                    className="w-full border border-current/20 bg-transparent px-3 py-2 text-xs font-mono text-current focus:border-current focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase opacity-70 mb-1">
                    Headline / Review Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unbelievable fabric density"
                    className="w-full border border-current/20 bg-transparent px-3 py-2 text-xs font-mono text-current focus:border-current focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase opacity-70 mb-1">
                  Your Detailed Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the fabric feel, boxy drape, collar durability, or how you styled it..."
                  className="w-full border border-current/20 bg-transparent px-3 py-2 text-xs font-mono text-current focus:border-current focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-current/20 text-xs font-mono uppercase opacity-60 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 border border-current bg-current text-[var(--color-bg)] text-xs font-mono uppercase tracking-wider font-bold transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Post Review ↗"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews Feed */}
      <div className="divide-y divide-current/20">
        {loading ? (
          <p className="py-12 text-center text-xs font-mono opacity-50">
            Loading customer reviews...
          </p>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xl font-bold">No reviews for this piece yet.</p>
            <p className="text-xs font-mono opacity-60 mt-1">
              Be the first to share your thoughts on the {productTitle}.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="py-8 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500 text-sm">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s}>{s <= rev.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="font-bold text-sm tracking-tight">{rev.title}</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono opacity-50">
                  <span>
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-semibold text-current">{rev.author}</span>
                {rev.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>✓ Verified Buyer</span>
                  </span>
                )}
              </div>

              <p className="text-sm opacity-80 leading-relaxed pt-1 whitespace-pre-line">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
