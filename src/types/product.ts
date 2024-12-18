import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, "Category name is required"),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  attributes: z.record(z.union([z.string(), z.number()])).optional(),
  isVisible: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isActive: z.boolean().optional()
});

export type Product = z.infer<typeof ProductSchema> & {
  category: string; // This will now be the category SLUG
};

export type ProductFormData = Product & {
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
