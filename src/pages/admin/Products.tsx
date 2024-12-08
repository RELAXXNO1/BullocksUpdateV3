import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { Plus } from 'lucide-react';
import { ProductForm } from '../../components/admin/ProductForm';
import { ProductList } from '../../components/admin/ProductList';
import { CategoryManager } from '../../components/admin/CategoryManager';
import { BackButton } from '../../components/ui/BackButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Product, ProductFormData } from '../../types/product';

export default function Products() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data);
      } else {
        await addProduct(data);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <BackButton to="/admin/dashboard" />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Products</h1>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>
      <CategoryManager />

      <ProductList
        products={products}
        onEdit={handleEditProduct}
        onDelete={deleteProduct}
      />

      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          onSubmit={handleSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}