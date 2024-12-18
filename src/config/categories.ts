import type { CategoryConfig } from '../constants/categories';

export const categories: CategoryConfig[] = [
  {
    id: 'thca-flower',
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
          description: 'The specific strain of the THC-A flower.'
        },
        { 
          name: 'thcAPercentage', 
          label: 'THC-A %', 
          type: 'number',
          displayOnCard: true,
          description: 'The percentage of the plant comprised of THC-A.'
        },
        { 
          name: 'Infused', 
          label: 'Diamonds', 
          type: 'boolean',
          displayOnCard: true,
          description: 'Indicates if the flower is infused with diamonds.'
        }
      ]
    }
  },
  {
    id: 'pre-rolls',
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
          description: 'The number of pre-rolls in a pack.'
        },
        {
          name: 'Infused', 
          label: 'Diamonds', 
          type: 'boolean',
          displayOnCard: true,
          description: 'Indicates if the pre-roll is infused with diamonds.'
        },
        { 
          name: 'weight', 
          label: 'Weight (g)', 
          type: 'number',
          displayOnCard: true,
          description: 'The weight of the pre-roll in grams.'
        }
      ]
    }
  },
  {
    id: 'edibles',
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
          description: 'The amount of THC in milligrams per serving.'
        },
        { 
          name: 'dietaryRestrictions', 
          label: 'Dietary Info', 
          type: 'select', 
          options: ['Vegan', 'Gluten-Free', 'Sugar-Free', 'None'],
          displayOnCard: true,
          description: 'Dietary information about the edible.'
        }
      ]
    }
  },
  {
    id: 'mushrooms',
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
          description: 'The type of mushroom in the product.'
        },
        { 
          name: 'potency', 
          label: 'Potency', 
          type: 'select', 
          options: ['Micro', 'Low', 'Medium', 'High'],
          displayOnCard: true,
          description: 'The potency level of the mushroom product.'
        }
      ]
    }
  },
  {
    id: 'vapes-disposables',
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
          description: 'The battery capacity of the vape in milliampere-hours.'
        },
        { 
          name: 'flavor', 
          label: 'Flavor', 
          type: 'text',
          displayOnCard: true,
          description: 'The flavor of the vape product.'
        }
      ]
    }
  },
  {
    id: 'glass-pipes',
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
          description: 'The material of the glass pipe.'
        },
        { 
          name: 'size', 
          label: 'Size', 
          type: 'select', 
          options: ['Small', 'Medium', 'Large'],
          displayOnCard: true,
          description: 'The size of the glass pipe.'
        }
      ]
    }
  },
  {
    id: 'tobacco-products',
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
          description: 'The type of tobacco product.'
        }
      ]
    }
  },
  {
    id: 'lighters-torches',
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
          description: 'The type of lighter or torch.'
        }
      ]
    }
  }
];

export const DEFAULT_CATEGORIES = categories;
