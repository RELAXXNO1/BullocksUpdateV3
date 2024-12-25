import { StoreContent } from '../models/StoreContent';

const defaultStoreContent: StoreContent[] = [
  {
    id: 'hero-section',
    section: 'hero',
    title: 'Discover Premium THC-A Products',
    description: 'Explore our curated selection of high-quality THC-A products.',
    isVisible: true,
    lastUpdated: Date.now(),
    images: [
      '/logos/1723577384350-692c6eda-547c-43ac-99b0-e408b46b04d3_1-removebg-preview.png',
      '/logos/black_logo_transparent_background_page-0001-removebg-preview.png',
    ],
  },
  {
    id: 'products-section',
    section: 'products',
    title: 'Our Products',
    description: 'Check out our wide range of products.',
    isVisible: true,
    lastUpdated: Date.now(),
  },
  {
    id: 'about-section',
    section: 'about',
    title: 'About Us',
    description: 'Learn more about our company and mission.',
    isVisible: false,
    lastUpdated: Date.now(),
  },
  {
    id: 'custom-section',
    section: 'custom',
    title: 'Custom Section',
    description: 'This is a custom section.',
    isVisible: false,
    lastUpdated: Date.now(),
  },
];

export default defaultStoreContent;
