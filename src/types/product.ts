export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  attributes?: ProductAttributes;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  attributes?: CategoryAttributes;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryAttributes {
  fields: CategoryField[];
}

export interface CategoryField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}

export interface CategoryConfig extends Omit<Category, 'id' | 'createdAt' | 'updatedAt'> {
  attributes?: CategoryAttributes;
}

export type ProductCategory = 
  '' | 
  'thca-flower' | 
  'vapes' | 
  'tobacco' | 
  'edibles' | 
  'glass-pipes';

export interface ProductAttributes {
  [key: string]: any;
  brand?: string;
  material?: string;
  color?: string;
  size?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

export interface ProductFormData extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
  imageFile?: File;
}