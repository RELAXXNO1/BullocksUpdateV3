import { Edit2, Trash2 } from 'lucide-react';
import type { Product } from '../../types/product';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string, imageUrl: string) => Promise<void>;
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const handleDelete = async (product: Product) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await onDelete(product.id, product.imageUrl);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-slate-800 rounded-lg overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{product.name}</h3>
              <span className="text-blue-500">${product.price}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm bg-slate-700 px-2 py-1 rounded">
                {product.category}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 hover:bg-slate-700 rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="p-2 hover:bg-slate-700 rounded text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}