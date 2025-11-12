import { TopRatedListProps } from "../../../../types/products";
import { money } from "../../../../utils/money";
import Stars from "./Stars";

function TopRatedList({ items, onView }: TopRatedListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Top rated</h3>
      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            <img src={p.thumbnail} alt={p.title} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <button onClick={() => onView?.(p)} className="text-sm font-medium text-gray-900">{p.title}</button>
                <div className="text-sm text-gray-500">{money(p.price)}</div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Stars value={p.rating ?? 0} />
                <div className="text-xs text-gray-500">{p.reviews?.length ?? 0} reviews</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopRatedList