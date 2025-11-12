'use client';

import React, { useState } from 'react';
import api from '@/src/lib/apiClient';
import { useRouter } from 'next/navigation';
import { Product } from '@/src/types/products';
import Modal from '@/src/components/Modal';
import { useToast } from '@/src/components/ToastProvider';

export default function AddProductPage() {
  const router = useRouter();
  const { showToast } = useToast();

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

  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // modal state for cancel/discard
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onChange = (k: keyof typeof form, v: string | number) => {
    setForm((s) => ({ ...s, [k]: v }));
    setIsDirty(true);
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

  const handleCreate = async (e: React.FormEvent) => {
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

      const res = await api.post('/products', payload);
      const created: Product = res.data;

      // Show success toast, navigate to created product
      showToast({ title: 'Created', description: 'Product created successfully.', type: 'success' });
      setIsDirty(false);
      router.push(`/products/${created.id}`);
    } catch (err: any) {
      console.error('Create failed', err);
      showToast({ title: 'Create failed', description: (err?.response?.data?.message as string) ?? 'Create failed', type: 'error' });
      setMessage({ type: 'error', text: (err?.response?.data?.message as string) ?? 'Create failed' });
    } finally {
      setSaving(false);
    }
  };

  // Cancel handler — if dirty, ask for confirmation via modal
  const handleCancel = () => {
    if (isDirty) {
      setConfirmOpen(true);
      return;
    }
    router.push('/products');
  };

  const handleDiscardConfirm = () => {
    setConfirmOpen(false);
    setIsDirty(false);
    router.push('/products');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-xl font-semibold mb-4">Add new product</h1>

          {message && (
            <div className={`mb-4 px-3 py-2 rounded ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
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
                {saving ? 'Creating...' : 'Create product'}
              </button>

              <button type="button" onClick={handleCancel} className="px-4 py-2 rounded border">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm discard modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Discard changes?"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setConfirmOpen(false)} className="px-3 py-2 rounded border">Stay</button>
            <button onClick={handleDiscardConfirm} className="px-3 py-2 rounded bg-red-600 text-white">Discard</button>
          </div>
        }
      >
        <p className="text-sm text-gray-700">You have unsaved changes. Are you sure you want to discard them?</p>
      </Modal>
    </>
  );
}
