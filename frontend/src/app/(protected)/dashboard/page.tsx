'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import api from '@/src/lib/apiClient';
import { motion } from 'framer-motion';
import { useAuth } from '@/auth/useAuth';
import { useAtom } from 'jotai';
import { userAtom } from '@/src/atoms/authAtom';
import { Product } from "@/src/types/products";
import { Review } from "@/src/types/products";
import StatCard from './components/StatCard';
import ProductCard from './components/ProductCard';
import TopRatedList from './components/TopRatedList';
import RecentReviews from './components/RecentReviews';
import { money } from '@/src/utils/money';
import { useRouter } from 'next/navigation';
import Modal from '@/src/components/Modal';
import { useToast } from '@/src/components/ToastProvider';

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="h-28 rounded-lg bg-gray-100 animate-pulse" />
      <div className="h-28 rounded-lg bg-gray-100 animate-pulse" />
    </div>
  );
}

const productsFetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data as { data: Product[]; meta: { page: number; limit: number; total: number; totalPages: number } };
};

const dashboardFetcher = async (url: string) => {
  const res = await api.get(url);
  return res.data as {
    stats: { totalProducts: number; totalStock: number; avgPrice: number; avgRating: number };
    topRated: Product[];
    recentReviews: Review[];
  };
};

export default function Dashboard() {
  const { logout } = useAuth();
  const [user] = useAtom(userAtom);
  const router = useRouter();
  const { showToast } = useToast();

  const [page, setPage] = useState<number>(1);
  const limit = 4;
  const [query, setQuery] = useState<string>('');
  useEffect(() => setPage(1), [query]);
  const productsUrl = `/products?page=${page}&limit=${limit}${query ? `&search=${encodeURIComponent(query)}` : ''}`;
  const { data: productsResp, error: productsError, isLoading: productsLoading, mutate: mutateProducts } = useSWR(productsUrl, productsFetcher, { revalidateOnFocus: true });
  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading, mutate: mutateDashboard } = useSWR('/products/dashboard', dashboardFetcher, { revalidateOnFocus: true });
  const products = productsResp?.data ?? [];
  const meta = productsResp?.meta ?? { page, limit, total: 0, totalPages: 0 };

  const stats = dashboardData?.stats ?? { totalProducts: 0, totalStock: 0, avgPrice: 0, avgRating: 0 };
  const topRated = dashboardData?.topRated ?? [];
  const recentReviews = dashboardData?.recentReviews ?? [];

  const handleEdit = (p: Product) => { router.push(`/products/${p.id}/edit`); };
  const handleView = (p: Product) => router.push(`/products/${p.id}`);

  const goPrev = () => setPage((s) => Math.max(1, s - 1));
  const goNext = () => setPage((s) => Math.min(meta.totalPages || s + 1, s + 1));
  const goTo = (p: number) => setPage(Math.max(1, Math.min(p, meta.totalPages || p)));
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const handleDeleteClick = (p: Product) => {
    setDeletingProduct(p);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      showToast({ type: 'success', title: 'Deleted', description: `${deletingProduct.title} deleted.` });
      setDeleteModalOpen(false);
      setDeletingProduct(null);
      await Promise.all([mutateProducts(), mutateDashboard()]);
    } catch (err: any) {
      console.error('Delete failed', err);
      showToast({ type: 'error', title: 'Delete failed', description: (err?.response?.data?.message as string) ?? 'Could not delete product.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeletingProduct(null);
  };

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      if (btnRef.current && btnRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      router.push('/');
    } catch (err) {
      console.error('Logout failed', err);
      showToast({ type: 'error', title: 'Logout failed', description: 'Could not sign you out.' });
    }
  };

  const goProfile = () => {
    setOpen(false);
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Dashboard</h1>
            <p className="text-sm text-gray-600">Overview of catalog, stock and reviews.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              <button
                ref={btnRef}
                onClick={() => setOpen((s) => !s)}
                aria-haspopup="true"
                aria-expanded={open}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-300"
                title={user?.email ?? 'Account'}
              >
                {user?.email ? (
                  <span className="text-sm font-medium text-gray-700">{user.email.charAt(0).toUpperCase()}</span>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7h2c0-2.761 2.239-5 5-5s5 2.239 5 5h2c0-3.866-3.134-7-7-7z" /></svg>
                )}
              </button>

              <div
                className={`origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transform transition-all ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <button onClick={goProfile} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Profile</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" role="menuitem">Logout</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total products" value={dashboardLoading ? '—' : stats.totalProducts} subtitle="Total SKUs in catalogue" />
          <StatCard title="Average price" value={dashboardLoading ? '—' : money(stats.avgPrice)} subtitle="Average selling price" />
          <StatCard title="Average rating" value={dashboardLoading ? '—' : (stats.avgRating ?? 0).toFixed(2)} subtitle={dashboardLoading ? undefined : 'Across all reviews'} />
          <StatCard title="Total stock" value={dashboardLoading ? '—' : stats.totalStock} subtitle="Units available" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Products</h2>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title, brand or category"
                        className="w-72 rounded-lg border border-gray-200 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      />
                      <button onClick={() => router.push('/products/new')} className="ml-auto px-3 py-2 text-sm rounded-md bg-emerald-600 text-white">Add New</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productsLoading && <LoadingGrid />}

                {!productsLoading && products.length === 0 && <div className="text-sm text-gray-500 p-6 col-span-2">No products found.</div>}

                {!productsLoading && products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onEdit={() => handleEdit(p)}
                    onDelete={() => handleDeleteClick(p)}   
                    onView={() => handleView(p)}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Page {meta.page} of {meta.totalPages || 1}</div>

                <div className="inline-flex items-center gap-2">
                  <button onClick={goPrev} disabled={meta.page <= 1} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Prev</button>

                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, meta.totalPages || 1) }).map((_, i) => {
                      const half = Math.floor(5 / 2);
                      let start = Math.max(1, meta.page - half);
                      const end = Math.min((meta.totalPages || 1), start + 4);
                      start = Math.max(1, end - 4);
                      const pageNumber = start + i;
                      if (pageNumber > (meta.totalPages || 1)) return null;
                      return (
                        <button key={pageNumber} onClick={() => goTo(pageNumber)}
                          className={`px-3 py-1 rounded border ${pageNumber === meta.page ? 'bg-emerald-600 text-white' : 'bg-white'}`}>
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={goNext} disabled={meta.page >= (meta.totalPages || 1)} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Next</button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <TopRatedList items={topRated} onView={(p:any) => handleView(p)} />
            <RecentReviews reviews={recentReviews} />
          </aside>
        </div>
      </div>

      <Modal
        open={deleteModalOpen}
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
        <p className="text-sm text-gray-700">
          {deletingProduct ? `Are you sure you want to delete "${deletingProduct.title}"? This action cannot be undone.` : 'Are you sure you want to delete this product?'}
        </p>
      </Modal>
    </div>
  );
}
