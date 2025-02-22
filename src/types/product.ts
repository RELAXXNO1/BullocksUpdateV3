import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, "Category name is required"),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.union([
    z.number().positive("Price must be positive"),
    z.object({
        '1.75g': z.number(),
        '3.5g': z.number(),
        '7g': z.number(),
        '14g': z.number(),
        '1oz': z.number(),
    })
]),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  attributes: z.record(z.union([z.string(), z.number()])).optional(),
  isVisible: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isActive: z.boolean().optional(),
  promoId: z.string().optional()
});

export type Product = z.infer<typeof ProductSchema> & {
  category: string;
  isFeatured?: boolean;
  cartImage?: string;
  quantity?: number;
  pointsRequired?: number;
    price: number | {
        '1.75g': number;
        '3.5g': number;
        '7g': number;
        '14g': number;
        '1oz': number;
    };
};

export type ProductFormData = Omit<Product, 'price'> & {
  price: number | {
        '1.75g': number;
        '3.5g': number;
        '7g': number;
        '14g': number;
        '1oz': number;
    };
  imageFile?: File;
};

export interface CategoryAttribute {
  name: string;
  label: string;
  type: AttributeType;
  options?: string[];
  required?: boolean;
  displayOnCard?: boolean;
}

export type CategoryConfig = {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  attributes?: {
    fields: CategoryAttribute[];
  };
  createdAt?: string;
  updatedAt?: string;
};

export const AttributeTypeSchema = z.enum(['text', 'number', 'select', 'boolean']);
export type AttributeType = z.infer<typeof AttributeTypeSchema>;
