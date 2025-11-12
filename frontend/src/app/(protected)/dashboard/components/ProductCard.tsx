import { motion } from 'framer-motion';
import Stars from './Stars';
import { Product } from '../../../../types/products';
import { money } from '../../../../utils/money';

function ProductCard({ product, onEdit, onDelete, onView }: { product: Product; onEdit?: (p: Product) => void; onDelete?: (p: Product) => void; onView?: (p: Product) => void }) {
  return (
    <motion.article whileHover={{ scale: 1.01 }} className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="flex gap-3 p-3">
        <img src={product.thumbnail} alt={product.title} className="w-28 h-28 object-cover rounded-md flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{product.title}</h3>
            <div className="text-sm font-medium text-gray-900">{money(product.price)}</div>
          </div>

          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">Stock</div>
              <div className={`text-sm font-medium ${product.stock && product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{product.stock ?? 0}</div>
            </div>

            <div className="flex items-center gap-2">
              <Stars value={product.rating ?? 0} />
              <div className="text-xs text-gray-500">({product.reviews?.length ?? 0})</div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={() => onEdit?.(product)} className="px-3 py-1 text-sm rounded-md border border-gray-200">Edit</button>
            <button onClick={() => onDelete?.(product)} className="px-3 py-1 text-sm rounded-md bg-red-50 text-red-600">Delete</button>
            <button onClick={() => onView?.(product)} className="ml-auto px-3 py-1 text-sm rounded-md bg-emerald-600 text-white">View</button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
