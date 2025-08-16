import { z } from 'zod';

export const AttributeTypeSchema = z.enum(['text', 'number', 'select', 'boolean']);
export type AttributeType = z.infer<typeof AttributeTypeSchema>;

export interface CategoryAttribute {
  name: string;
  label: string;
  type: AttributeType;
  options?: string[];
  required?: boolean;
  displayOnCard?: boolean;
  description?: string;
  placeholder?: string; // Added placeholder property
}

export interface CategoryConfig {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  attributes?: {
    fields: CategoryAttribute[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    slug: 'thca-flower',
    name: 'thca-flower',
    description: 'Premium THC-A flower strains',
    attributes: {
      fields: [
        { 
          name: 'strain', 
          label: 'Strain', 
          type: 'select', 
          options: ['Indica', 'Sativa', 'Hybrid'],
          displayOnCard: true,
          placeholder: 'Select strain' // Example placeholder
        },
        { 
          name: 'thcAPercentage', 
          label: 'THC-A %', 
          type: 'number',
          displayOnCard: true,
          placeholder: 'Enter THC-A percentage' // Example placeholder
        },
        { 
          name: 'Infused', 
          label: 'Diamonds', 
          type: 'boolean',
          displayOnCard: true,
          placeholder: 'Is it infused with diamonds?' // Example placeholder
        }
      ]
    }
  },
  {
    slug: 'pre-rolls',
    name: 'pre-rolls',
    description: 'Ready-to-smoke pre-rolled joints',
    attributes: {
      fields: [
        { 
          name: 'packSize', 
          label: 'Pack Size', 
          type: 'select', 
          options: ['Single', '3 Pack', '5 Pack'],
          displayOnCard: true,
          placeholder: 'Select pack size'
        },
        {
          name: 'Infused', 
          label: 'Diamonds', 
          type: 'boolean',
          displayOnCard: true,
          placeholder: 'Is it infused with diamonds?'
        },
        { 
          name: 'weight', 
          label: 'Weight (g)', 
          type: 'number',
          displayOnCard: true,
          placeholder: 'Enter weight in grams'
        }
      ]
    }
  },
  {
    slug: 'edibles',
    name: 'Edibles',
    description: 'Cannabis-infused food and drink products',
    attributes: {
      fields: [
        { 
          name: 'thcMg', 
          label: 'THC (mg)', 
          type: 'number',
          displayOnCard: true,
          placeholder: 'Enter THC in mg'
        },
        { 
          name: 'dietaryRestrictions', 
          label: 'Dietary Info', 
          type: 'select', 
          options: ['Vegan', 'Gluten-Free', 'Sugar-Free', 'None'],
          displayOnCard: true,
          placeholder: 'Select dietary info'
        }
      ]
    }
  },
  {
    slug: 'mushrooms',
    name: 'Mushrooms',
    description: 'Recreational and medicinal mushroom products',
    attributes: {
      fields: [
        { 
          name: 'mushroomType', 
          label: 'Mushroom Type', 
          type: 'select', 
          options: ['Psychedelic', 'Lion\'s Mane', 'Reishi', 'Cordyceps'],
          displayOnCard: true,
          placeholder: 'Select mushroom type'
        },
        { 
          name: 'potency', 
          label: 'Potency', 
          type: 'select', 
          options: ['Micro', 'Low', 'Medium', 'High'],
          displayOnCard: true,
          placeholder: 'Select potency'
        }
      ]
    }
  },
  {
    slug: 'vapes-disposables',
    name: 'vapes-disposables',
    description: 'Vaporizer and disposable cannabis products',
    attributes: {
      fields: [
        { 
          name: 'batteryCapacity', 
          label: 'Battery (mAh)', 
          type: 'number',
          displayOnCard: true,
          placeholder: 'Enter battery capacity'
        },
        { 
          name: 'flavor', 
          label: 'Flavor', 
          type: 'text',
          displayOnCard: true,
          placeholder: 'Enter flavor'
        }
      ]
    }
  },
  {
    slug: 'glass-pipes',
    name: 'glass-pipes',
    description: 'Smoking accessories and glassware',
    attributes: {
      fields: [
        { 
          name: 'material', 
          label: 'Material', 
          type: 'select', 
          options: ['Borosilicate Glass', 'Quartz', 'Ceramic'],
          displayOnCard: true,
          placeholder: 'Select material'
        },
        { 
          name: 'size', 
          label: 'Size', 
          type: 'select', 
          options: ['Small', 'Medium', 'Large'],
          displayOnCard: true,
          placeholder: 'Select size'
        }
      ]
    }
  },
  {
    slug: 'tobacco-products',
    name: 'tobacco-products',
    description: 'Tobacco and smoking accessories',
    attributes: {
      fields: [
        { 
          name: 'tobaccoType', 
          label: 'Tobacco Type', 
          type: 'select', 
          options: ['Cigarettes', 'Cigars', 'Loose Leaf', 'Chewing Tobacco'],
          displayOnCard: true,
          placeholder: 'Select tobacco type'
        }
      ]
    }
  },
  {
    slug: 'lighters-torches',
    name: 'lighters-torches',
    description: 'Lighting accessories',
    attributes: {
      fields: [
        { 
          name: 'type', 
          label: 'Type', 
          type: 'select', 
          options: ['Disposable', 'Refillable', 'Torch', 'Electric'],
          displayOnCard: true,
          placeholder: 'Select lighter type'
        }
      ]
    }
  }
];
