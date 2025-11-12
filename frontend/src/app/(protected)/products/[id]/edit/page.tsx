// src/app/products/[id]/edit/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import api from '@/src/lib/apiClient';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/src/types/products';
import { money } from '@/src/utils/money';
import Modal from '@/src/components/Modal';
import { useToast } from '@/src/components/ToastProvider';

const fetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data as Product;
};

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: product, error, isLoading, mutate } = useSWR(id ? `/products/${id}` : null, fetcher);

  const { showToast } = useToast();

  // local form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    discountPercentage: 0,
    rating: 0,
    stock: 0,
    brand: '',
    sku: '',
    thumbnail: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // populate form when product loads
  useEffect(() => {
    if (!product) return;
    setForm({
      title: product.title ?? '',
      description: product.description ?? '',
      category: product.category ?? '',
      price: product.price ?? 0,
      discountPercentage: product.discountPercentage ?? 0,
      rating: product.rating ?? 0,
      stock: product.stock ?? 0,
      brand: product.brand ?? '',
      sku: product.sku ?? '',
      thumbnail: product.thumbnail ?? '',
    });
  }, [product]);

  if (!id) return <div className="p-6">Invalid product id</div>;
  if (isLoading) return <div className="p-6">Loading product...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load product.</div>;
  if (!product) return <div className="p-6">Product not found.</div>;

  const onChange = (k: keyof typeof form, v: string | number) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  const validate = () => {
    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return false;
    }
    if (isNaN(Number(form.price)) || Number(form.price) < 0) {
      setMessage({ type: 'error', text: 'Price must be a valid non-negative number' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        discountPercentage: Number(form.discountPercentage),
        rating: Number(form.rating),
        stock: Number(form.stock),
        brand: form.brand,
        sku: form.sku,
        thumbnail: form.thumbnail,
      };

      await api.put(`/products/${id}`, payload);

      // show toast for success
      showToast({ title: 'Saved', description: 'Product updated successfully.', type: 'success' });

      // revalidate product and optionally other lists
      await mutate();

      // small delay to let user see toast, then navigate back to product page
      setTimeout(() => {
        router.push(`/products/${id}`);
      }, 700);
    } catch (err: any) {
      console.error('Update failed', err);
      // show error toast
      showToast({ title: 'Update failed', description: (err?.response?.data?.message as string) ?? 'Update failed', type: 'error' });
      setMessage({ type: 'error', text: (err?.response?.data?.message as string) ?? 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  // open confirm modal instead of native confirm
  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${id}`);
      showToast({ title: 'Deleted', description: 'Product deleted successfully.', type: 'success' });

      // revalidate caches if needed (for lists / dashboard)
      // Optionally call mutate for product lists / dashboard endpoints (if you have refs)
      // e.g., mutateProducts && mutateProducts()
      // Here we redirect to products list after deletion
      setTimeout(() => {
        router.push('/products');
      }, 300);
    } catch (err: any) {
      console.error('Delete failed', err);
      showToast({ title: 'Delete failed', description: (err?.response?.data?.message as string) ?? 'Could not delete product.', type: 'error' });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-semibold mb-4">Edit product</h1>

        {/* inline validation message (keeps behavior you had) */}
        {message && (
          <div className={`mb-4 px-3 py-2 rounded ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input value={form.title} onChange={(e) => onChange('title', e.target.value)} className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description} onChange={(e) => onChange('description', e.target.value)} className="mt-1 block w-full rounded border px-3 py-2 text-sm min-h-[100px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (number) *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => onChange('price', Number(e.target.value))} className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount %</label>
              <input type="number" step="0.01" value={form.discountPercentage} onChange={(e) => onChange('discountPercentage', Number(e.target.value))} className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => onChange('stock', Number(e.target.value))} className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => onChange('rating', Number(e.target.value))} className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input value={form.brand} onChange={(e) => onChange('brand', e.target.value)} className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input value={form.category} onChange={(e) => onChange('category', e.target.value)} className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input value={form.sku} onChange={(e) => onChange('sku', e.target.value)} className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
            <input value={form.thumbnail} onChange={(e) => onChange('thumbnail', e.target.value)} placeholder="https://..." className="mt-1 block w-full rounded border px-3 py-2 text-sm" />
            {form.thumbnail && <img src={form.thumbnail} alt="thumb preview" className="mt-2 w-32 h-20 object-cover rounded border" />}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-emerald-600 text-white">
              {saving ? 'Saving...' : 'Save changes'}
            </button>

            <button type="button" onClick={() => router.push(`/products/${id}`)} className="px-4 py-2 rounded border">
              Cancel
            </button>

            <button type="button" onClick={handleDelete} className="ml-auto px-3 py-2 rounded bg-red-50 text-red-600 border">
              Delete product
            </button>
          </div>
        </form>
      </div>

      {/* Confirm delete modal */}
      <Modal
        open={confirmOpen}
        onClose={handleDeleteCancel}
        title="Delete product"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={handleDeleteCancel} className="px-3 py-2 rounded border">Cancel</button>
            <button onClick={handleDeleteConfirm} className="px-3 py-2 rounded bg-red-600 text-white">
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
        <p className="text-sm text-gray-500 mt-2"><strong>{product.title}</strong></p>
      </Modal>
    </div>
  );
}
