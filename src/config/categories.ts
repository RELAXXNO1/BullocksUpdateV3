import type { CategoryConfig } from '../types/product';

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    name: 'THC-A Flower',
    slug: 'thca-flower',
    description: 'Premium THC-A flower products',
    attributes: {
      fields: [
        { name: 'thcaContent', label: 'THC-A Content (%)', type: 'number' },
        { name: 'strain', label: 'Strain Type', type: 'select', options: ['Sativa', 'Indica', 'Hybrid'] },
        { name: 'weight', label: 'Weight (g)', type: 'number' },
        { name: 'origin', label: 'Origin', type: 'text' }
      ]
    }
  },
  {
    name: 'Vapes',
    slug: 'vapes',
    description: 'Vaporizers and cartridges',
    attributes: {
      fields: [
        { name: 'type', label: 'Type', type: 'select', options: ['Disposable', 'Cartridge', 'Device'] },
        { name: 'capacity', label: 'Capacity (ml)', type: 'number' },
        { name: 'batteryCapacity', label: 'Battery Capacity (mAh)', type: 'number' },
        { name: 'coilType', label: 'Coil Type', type: 'text' }
      ]
    }
  },
  {
    name: 'Tobacco Products',
    slug: 'tobacco',
    description: 'Premium tobacco and smoking accessories',
    attributes: {
      fields: [
        { name: 'type', label: 'Type', type: 'select', options: ['Cigarettes', 'Cigars', 'Pipe Tobacco', 'Rolling Tobacco'] },
        { name: 'weight', label: 'Weight (g)', type: 'number' },
        { name: 'flavor', label: 'Flavor', type: 'text' },
        { name: 'origin', label: 'Origin', type: 'text' }
      ]
    }
  },
  {
    name: 'Edibles',
    slug: 'edibles',
    description: 'THC and CBD edible products',
    attributes: {
      fields: [
        { name: 'type', label: 'Type', type: 'select', options: ['Gummies', 'Chocolates', 'Baked Goods', 'Beverages'] },
        { name: 'thcContent', label: 'THC Content (mg)', type: 'number' },
        { name: 'cbdContent', label: 'CBD Content (mg)', type: 'number' },
        { name: 'servingSize', label: 'Serving Size', type: 'text' },
        { name: 'servingsPerPackage', label: 'Servings Per Package', type: 'number' }
      ]
    }
  },
  {
    name: 'Glass & Pipes',
    slug: 'glass-pipes',
    description: 'High-quality glass pieces and smoking pipes',
    attributes: {
      fields: [
        { name: 'type', label: 'Type', type: 'select', options: ['Water Pipes', 'Hand Pipes', 'Dab Rigs', 'Accessories'] },
        { name: 'material', label: 'Material', type: 'text' },
        { name: 'height', label: 'Height (inches)', type: 'number' },
        { name: 'jointSize', label: 'Joint Size', type: 'text' },
        { name: 'percolators', label: 'Percolators', type: 'number' }
      ]
    }
  }
];