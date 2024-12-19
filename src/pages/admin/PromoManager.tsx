import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, Timestamp, onSnapshot, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Product } from '../../types/product';

const PromoManager = () => {
  const [promoData, setPromoData] = useState({
    product: '',
    discount: '',
    startDate: '',
    endDate: '',
    textPromo: '',
  });
  interface Promo {
    id: string;
    product: string;
    discount: number;
    startDate: any;
    endDate: any;
  }
  const [promos, setPromos] = useState<Promo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  useEffect(() => {
    const fetchPromos = async () => {
      const promoCollection = collection(db, 'promos');
      const q = query(promoCollection);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const promoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Promo);
        setPromos(promoList);
      });
      return () => unsubscribe();
    };

    const fetchProducts = async () => {
      const productsCollection = collection(db, 'products');
      const q = query(productsCollection);
      const productsSnapshot = await getDocs(q);
      const productsList = productsSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Product));
      setProducts(productsList);
    };

    fetchPromos();
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const promoCollection = collection(db, 'promos');
      const newPromoRef = await addDoc(promoCollection, {
        product: promoData.product,
        discount: Number(promoData.discount),
        startDate: Timestamp.fromDate(new Date(promoData.startDate)),
        endDate: Timestamp.fromDate(new Date(promoData.endDate)),
        textPromo: promoData.textPromo,
      });
      console.log('Promo data saved successfully!');

      if (selectedProduct) {
        const productRef = doc(db, 'products', selectedProduct);
        await updateDoc(productRef, { promoId: newPromoRef.id });
        console.log('Promo assigned to product successfully!');
      }

      setPromoData({ product: '', discount: '', startDate: '', endDate: '', textPromo: '' }); // Reset form
      setSelectedProduct('');
    } catch (error) {
      console.error('Error saving promo data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoData({ ...promoData, [e.target.name]: e.target.value });
  };

  const handleDeletePromo = async (promoId: string) => {
    try {
      const promoRef = doc(db, 'promos', promoId);
      await deleteDoc(promoRef);
      console.log('Promo deleted successfully!');
    } catch (error) {
      console.error('Error deleting promo:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">Promo Manager</h1>
      <p className="text-gray-300 mb-4">This is where you can manage your store promotions.</p>
      <div className="bg-slate-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Create New Promo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Promo Message</label>
            <input 
              type="text" 
              name="product"
              value={promoData.product}
              onChange={handleChange}
              className="bg-dark-700 text-white border border-dark-400 rounded w-full py-2 px-3 focus:outline-none focus:border-primary-500" 
              placeholder="Enter promo message," 
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Discount (%)</label>
            <input 
              type="number"
              name="discount"
              value={promoData.discount}
              onChange={handleChange}
              className="bg-dark-700 text-white border border-dark-400 rounded w-full py-2 px-3 focus:outline-none focus:border-primary-500" 
              placeholder="Enter discount percentage" 
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Text Promo</label>
            <input 
              type="text"
              name="textPromo"
              value={promoData.textPromo}
              onChange={handleChange}
              className="bg-dark-700 text-white border border-dark-400 rounded w-full py-2 px-3 focus:outline-none focus:border-primary-500" 
              placeholder="Enter text promo like Buy 1 Get 1 Free" 
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Start Date</label>
            <input 
              type="date" 
              name="startDate"
              value={promoData.startDate}
              onChange={handleChange}
              className="bg-dark-700 text-white border border-dark-400 rounded w-full py-2 px-3 focus:outline-none focus:border-primary-500" 
            />
          </div>
           <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">End Date</label>
            <input 
              type="date" 
              name="endDate"
              value={promoData.endDate}
              onChange={handleChange}
              className="bg-dark-700 text-white border border-dark-400 rounded w-full py-2 px-3 focus:outline-none focus:border-primary-500" 
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Assign to Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-dark-700 text-white border border-dark-400 rounded w-full py-2 px-3 focus:outline-none focus:border-primary-500"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none">Create Promo</button>
        </form>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Current Promos</h2>
        <ul className="space-y-4">
          {promos.map((promo) => (
            <li key={promo.id} className="bg-dark-700 p-4 rounded-lg shadow-md">
              <p className="text-gray-300">
                <span className="font-semibold text-gray-100">Product:</span> {promo.product}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-gray-100">Discount:</span> {promo.discount}%
              </p>
              <p className="text-gray-300">
                <span className="font-semibold text-gray-100">Start Date:</span> {promo.startDate.toDate().toLocaleDateString()}
              </p>
               <p className="text-gray-300">
                <span className="font-semibold text-gray-100">End Date:</span> {promo.endDate.toDate().toLocaleDateString()}
              </p>
              <button 
                onClick={() => handleDeletePromo(promo.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none mt-2"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PromoManager;
