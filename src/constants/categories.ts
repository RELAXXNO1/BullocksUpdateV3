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
          displayOnCard: true 
        },
        { 
          name: 'thcAPercentage', 
          label: 'THC-A %', 
          type: 'number',
          displayOnCard: true 
        },
        { 
          name: 'Infused', 
          label: 'Diamonds', 
          type: 'boolean',
          displayOnCard: true 
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
          displayOnCard: true 
        },
        {
          name: 'Infused', 
          label: 'Diamonds', 
          type: 'boolean',
          displayOnCard: true 
        },
        { 
          name: 'weight', 
          label: 'Weight (g)', 
          type: 'number',
          displayOnCard: true 
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
          displayOnCard: true 
        },
        { 
          name: 'dietaryRestrictions', 
          label: 'Dietary Info', 
          type: 'select', 
          options: ['Vegan', 'Gluten-Free', 'Sugar-Free', 'None'],
          displayOnCard: true 
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
          displayOnCard: true 
        },
        { 
          name: 'potency', 
          label: 'Potency', 
          type: 'select', 
          options: ['Micro', 'Low', 'Medium', 'High'],
          displayOnCard: true 
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
          displayOnCard: true 
        },
        { 
          name: 'flavor', 
          label: 'Flavor', 
          type: 'text',
          displayOnCard: true 
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
          displayOnCard: true 
        },
        { 
          name: 'size', 
          label: 'Size', 
          type: 'select', 
          options: ['Small', 'Medium', 'Large'],
          displayOnCard: true 
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
          displayOnCard: true 
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
          displayOnCard: true 
        }
      ]
    }
  }
];
