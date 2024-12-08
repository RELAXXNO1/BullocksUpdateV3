import { DEFAULT_CATEGORIES } from '../config/categories';
import type { ProductFormData, ProductCategory } from '../types/product';

export function validateProductAttributes(
  category: ProductCategory, 
  attributes: Record<string, any>
): { valid: boolean; errors: string[] } {
  if (!category) {
    return { valid: false, errors: ['Category is required'] };
  }

  const categoryConfig = DEFAULT_CATEGORIES.find(cat => cat.slug === category);
  if (!categoryConfig) {
    return { valid: false, errors: ['Invalid category'] };
  }

  const errors: string[] = [];

  categoryConfig.attributes?.fields.forEach(field => {
    const value = attributes[field.name];

    // Check if required fields are present
    if (value === undefined || value === null || value === '') {
      errors.push(`${field.label} is required`);
      return;
    }

    // Type validation
    switch (field.type) {
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`${field.label} must be a valid number`);
        }
        break;
      case 'text':
        if (typeof value !== 'string') {
          errors.push(`${field.label} must be a string`);
        }
        break;
      case 'select':
        if (field.options && !field.options.includes(value)) {
          errors.push(`${field.label} must be one of: ${field.options.join(', ')}`);
        }
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateProductForm(productData: ProductFormData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validations
  if (!productData.name) errors.push('Product name is required');
  if (productData.price <= 0) errors.push('Price must be greater than 0');
  if (!productData.category) errors.push('Category is required');

  // Attribute validation
  if (productData.category && productData.attributes) {
    const attributeValidation = validateProductAttributes(
      productData.category, 
      productData.attributes
    );

    if (!attributeValidation.valid) {
      errors.push(...attributeValidation.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
