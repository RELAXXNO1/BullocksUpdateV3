import { StoreContent } from '../models/StoreContent';
import { storage } from './firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

const fetchDefaultStoreContent = async (): Promise<StoreContent[]> => {
  const storageRef = ref(storage, 'storeContent');
  try {
    const res = await listAll(storageRef);
    const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));

    // Assuming the files in storage are named with the section id, and the images are in a subfolder named 'images'
    const heroImages = urls.filter(url => url.includes('hero/images/'));
    const productsImages = urls.filter(url => url.includes('products/images/'));
    const aboutImages = urls.filter(url => url.includes('about/images/'));
    const customImages = urls.filter(url => url.includes('custom/images/'));

    return [
      {
        id: 'hero-section',
        section: 'hero',
        title: 'Discover Premium THC-A Products',
        description: 'Explore our curated selection of high-quality THC-A products.',
        isVisible: true,
        lastUpdated: Date.now(),
        images: heroImages,
      },
      {
        id: 'products-section',
        section: 'products',
        title: 'Our Products',
        description: 'Check out our wide range of products.',
        isVisible: true,
        lastUpdated: Date.now(),
        images: productsImages,
      },
      {
        id: 'about-section',
        section: 'about',
        title: 'About Us',
        description: 'Learn more about our company and mission.',
        isVisible: false,
        lastUpdated: Date.now(),
        images: aboutImages,
      },
      {
        id: 'custom-section',
        section: 'custom',
        title: 'Custom Section',
        description: 'This is a custom section.',
        isVisible: false,
        lastUpdated: Date.now(),
        images: customImages,
      },
    ];
  } catch (error) {
    console.error('Error fetching default store content from Firebase Storage:', error);
    return [];
  }
};

export default fetchDefaultStoreContent;
