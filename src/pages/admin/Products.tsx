import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductForm } from '../../components/admin/ProductForm';
import { Product } from '../../types/product';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trash2, Edit, Package } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsList = productsSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Product));
        setProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsAddingProduct(true);
  };

  const handleCloseProductForm = () => {
    setIsAddingProduct(false);
    setSelectedProduct(undefined);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button 
          onClick={() => setIsAddingProduct(true)}
          variant="default"
          className="font-semibold tracking-wide shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
        >
          Add New Product
        </Button>
      </div>

      {isAddingProduct && (
        <ProductForm 
          onClose={handleCloseProductForm} 
          initialProduct={selectedProduct} 
        />
      )}

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 
          bg-gradient-to-br from-teal-800 to-teal-900 
          border border-teal-700 
          rounded-xl 
          text-center 
          space-y-6 
          relative 
          overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-700/10 to-transparent opacity-30"></div>
          
          <div className="bg-teal-700/50 p-4 rounded-full border border-teal-600/50 relative z-10">
            <Package className="h-12 w-12 text-teal-200" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold text-teal-100 mb-4">
              Ready to Expand Your Inventory?
            </h2>
            <p className="text-teal-300 max-w-md mx-auto mb-6">
              It looks like your product catalog is empty. Click "Add New Product" to start building your amazing collection!
            </p>
            <Button 
              onClick={() => setIsAddingProduct(true)}
              variant="default"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300"
            >
              Add Your First Product
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl 
              shadow-xl ring-1 ring-white/10 p-4 
              hover:ring-blue-500/50 transition-all duration-300 
              group relative overflow-hidden"
          >
            <div className="relative mb-4">
              <img 
                src={product.images?.[0] || '/placeholder.png'} 
                alt={product.name} 
                className="w-full h-48 object-cover rounded-xl 
                  transition-transform duration-300 
                  group-hover:scale-105"
              />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">
                {product.name}
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-emerald-500 font-bold">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="bg-blue-600/10 text-blue-400 
                      hover:bg-blue-600/20 p-2 rounded-full 
                      transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-600/10 text-red-400 
                      hover:bg-red-600/20 p-2 rounded-full 
                      transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
