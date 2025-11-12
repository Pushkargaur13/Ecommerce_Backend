function HeaderBar({ userEmail, onCreate, onRefresh }: { userEmail?: string; onCreate: () => void; onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of catalog, stock and reviews.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <input placeholder="Search by title, brand or category" className="w-72 rounded-lg border border-gray-200 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
        <button onClick={onCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-700">New product</button>
        <button onClick={onRefresh} className="px-4 py-2 rounded-lg bg-gray-100 border">Refresh</button>
        {userEmail && <div className="text-sm text-gray-600">{userEmail}</div>}
      </div>
    </div>
  );
}

export default HeaderBar