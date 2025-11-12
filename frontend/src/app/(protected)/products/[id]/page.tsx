'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import api from '@/src/lib/apiClient';
import { useParams, useRouter } from 'next/navigation';
import { Product, Review } from '@/src/types/products';
import Stars from '@/src/app/(protected)/dashboard/components/Stars';
import { money } from '@/src/utils/money';
import { motion } from 'framer-motion';
import Modal from '@/src/components/Modal';
import { useToast } from '@/src/components/ToastProvider';

const fetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data as Product;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const { data: product, error, isLoading, mutate } = useSWR<Product>(
    id ? `/products/${id}` : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const { showToast } = useToast();

  const [addingReview, setAddingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', reviewerEmail: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/products/${id}/edit`);
  };

  // open modal
  const handleDelete = () => {
    setConfirmOpen(true);
  };

  // confirm delete
  const handleDeleteConfirm = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${id}`);
      showToast({ title: 'Deleted', description: 'Product deleted successfully.', type: 'success' });
      // redirect back to list
      setTimeout(() => router.push('/products'), 300);
    } catch (err: any) {
      console.error(err);
      showToast({ title: 'Delete failed', description: (err?.response?.data?.message as string) ?? 'Could not delete product.', type: 'error' });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      // Adjust endpoint if your API expects POST /products/:id/reviews instead
      await api.post(`/reviews/${id}`, reviewForm);
      setReviewForm({ reviewerName: '', reviewerEmail: '', rating: 5, comment: '' });
      setAddingReview(false);
      await mutate(); // refresh product to show new review
      showToast({ title: 'Thanks!', description: 'Your review was added.', type: 'success' });
    } catch (err: any) {
      console.error(err);
      showToast({ title: 'Failed', description: (err?.response?.data?.message as string) ?? 'Failed to add review.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast({ title: 'Copied', description: 'Product link copied to clipboard.', type: 'success' });
    } catch (err) {
      showToast({ title: 'Copy failed', description: 'Could not copy link.', type: 'error' });
    }
  };

  const images = useMemo(() => {
    if (!product) return [];
    const imgs = (product as any).images ?? (product.thumbnail ? [product.thumbnail] : []);
    return Array.isArray(imgs) ? imgs : [imgs];
  }, [product]);

  if (!id) {
    return <div className="p-6">Invalid product id</div>;
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">Failed to load product.</div>;
  }

  if (!product) {
    return <div className="p-6">Product not found.</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="w-1/2">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm text-gray-500">Images</div>

                <div className="w-full bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {images.length > 0 ? (
                    <img src={images[0]} alt={product.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {images.map((src, idx) => (
                      <button key={idx} className="w-20 h-20 flex-shrink-0 rounded overflow-hidden border" onClick={() => window.open(src, '_blank')}>
                        <img src={src} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-1/2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-gray-900">{product.title}</h1>
                    <div className="mt-2 flex items-center gap-3">
                      <Stars value={product.rating ?? 0} />
                      <div className="text-sm text-gray-500">({product.reviews?.length ?? 0} reviews)</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{money(product.price)}</div>
                    {product.discountPercentage ? (
                      <div className="text-sm text-emerald-600">{product.discountPercentage}% off</div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-700">
                  <p>{product.description ?? 'No description provided.'}</p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-600">
                  <div><strong>Brand:</strong> <span className="ml-1">{product.brand ?? '—'}</span></div>
                  <div><strong>Category:</strong> <span className="ml-1">{product.category ?? '—'}</span></div>
                  <div><strong>SKU:</strong> <span className="ml-1">{product.sku ?? '—'}</span></div>
                  <div><strong>Stock:</strong> <span className={`ml-1 ${product.stock && product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{product.stock ?? 0}</span></div>
                  <div><strong>Created:</strong> <span className="ml-1">{product.createdAt ? new Date(product.createdAt).toLocaleString() : '—'}</span></div>
                  <div><strong>Updated:</strong> <span className="ml-1">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '—'}</span></div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button onClick={handleEdit} className="px-4 py-2 rounded bg-emerald-600 text-white">Edit</button>
                  <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-50 text-red-600 border">Delete</button>
                  <button onClick={handleCopyLink} className="ml-auto px-3 py-2 rounded border">Share</button>
                </div>
              </div>
            </div>
          </div>

          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
              <div className="text-sm text-gray-600">{product.reviews?.length ?? 0} reviews</div>
            </div>

            <div className="mt-4 space-y-4 h-64 overflow-y-scroll">
              {(!product.reviews || product.reviews.length === 0) && <div className="text-sm text-gray-500">No reviews yet.</div>}

              {(product.reviews ?? []).slice().reverse().map((r: Review) => (
                <div key={r.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{r.reviewerName}</div>
                      <div className="text-xs text-gray-500">{new Date(r.date).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} />
                      <div className="text-xs text-gray-500">({r.rating})</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">{r.comment}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              {!addingReview ? (
                <div className="flex items-center gap-3">
                  <button onClick={() => setAddingReview(true)} className="px-3 py-2 rounded bg-emerald-600 text-white">Add a review</button>
                </div>
              ) : (
                <form onSubmit={submitReview} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input required value={reviewForm.reviewerName} onChange={(e) => setReviewForm(s => ({ ...s, reviewerName: e.target.value }))} placeholder="Your name" className="w-full rounded border px-3 py-2 text-sm" />
                    <input required value={reviewForm.reviewerEmail} onChange={(e) => setReviewForm(s => ({ ...s, reviewerEmail: e.target.value }))} placeholder="Your email" type="email" className="w-full rounded border px-3 py-2 text-sm" />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700">Rating</label>
                    <select value={reviewForm.rating} onChange={(e) => setReviewForm(s => ({ ...s, rating: Number(e.target.value) }))} className="rounded border px-2 py-1 text-sm">
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <div>
                    <textarea required value={reviewForm.comment} onChange={(e) => setReviewForm(s => ({ ...s, comment: e.target.value }))} placeholder="Write your review" className="w-full rounded border px-3 py-2 text-sm min-h-[80px]" />
                  </div>

                  <div className="flex items-center gap-3">
                    <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-emerald-600 text-white">{submitting ? 'Saving...' : 'Submit review'}</button>
                    <button type="button" onClick={() => setAddingReview(false)} className="px-4 py-2 rounded border">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </motion.section>
        </div>
      </div>

      {/* Confirm delete modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete product"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setConfirmOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
            <button onClick={handleDeleteConfirm} className="px-3 py-2 rounded bg-red-600 text-white">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
        <p className="text-sm text-gray-500 mt-2"><strong>{product.title}</strong></p>
      </Modal>
    </>
  );
}
