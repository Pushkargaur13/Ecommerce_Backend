import { Review } from "../../../../types/products";

function RecentReviews({ reviews }: { reviews: Review[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-64 overflow-y-scroll">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent reviews</h3>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">{r.reviewerName.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
              <div>
                <div className="font-medium text-gray-900">{r.reviewerName}</div>
                <div className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</div>
                <div className="mt-1 text-sm text-gray-700">{r.comment}</div>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div className="text-sm text-gray-500">No reviews yet.</div>}
      </div>
    </div>
  );
}

export default RecentReviews