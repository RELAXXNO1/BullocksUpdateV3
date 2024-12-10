import { KnowledgeBase } from '../types/ai';

export const defaultKnowledgeBase: KnowledgeBase = {
  categories: [
    {
      id: 'store_info',
      name: 'Store Information',
      description: 'General information about Bullocks Smoke Shop',
      keywords: ['hours', 'location', 'contact', 'info'],
      capabilities: {}
    },
    {
      id: 'products',
      name: 'Product Inquiries',
      description: 'Questions about products and inventory',
      keywords: ['products', 'inventory', 'stock', 'items'],
      capabilities: {}
    },
    {
      id: 'policies',
      name: 'Store Policies',
      description: 'Information about store rules and policies',
      keywords: ['policy', 'rules', 'returns', 'age verification'],
      capabilities: {}
    }
  ],
  rules: [
    {
      id: 'age_verification',
      category: 'policies',
      condition: 'User asks about age requirements',
      action: 'Provide age verification policy',
      priority: 1
    }
  ],
  responses: [
    {
      id: 'store_hours',
      category: 'store_info',
      pattern: 'What are your store hours',
      response: 'We are open Monday-Saturday: 10am-8pm, Sunday: 12pm-6pm.',
      followUp: ['Do you need directions?', 'Want to know about our current promotions?']
    },
    {
      id: 'age_policy',
      category: 'policies',
      pattern: 'Age requirement',
      response: 'All customers must be 21+ to purchase tobacco and smoking products. Valid government-issued ID is required.',
      followUp: ['What types of ID do you accept?']
    },
    {
      id: 'product_availability',
      category: 'products',
      pattern: 'Do you have',
      response: 'Our inventory changes frequently. Visit our store or check our online catalog for the most up-to-date product information.',
      followUp: ['Can I reserve an item?', 'Do you offer online ordering?']
    }
  ],
  context: {
    storeInfo: {
      name: 'Bullocks Smoke Shop',
      location: '123 Main Street, Anytown, USA',
      hours: 'Mon-Sat: 10am-8pm, Sun: 12pm-6pm',
      contact: {
        phone: '(555) 123-4567',
        email: 'info@bullockssmokeshop.com'
      },
      policies: {
        ageVerification: '21+ for tobacco products',
        returns: '7-day return policy with receipt'
      }
    },
    productCategories: [
      'Cigars', 
      'Pipes', 
      'Tobacco', 
      'Accessories'
    ],
    commonQueries: [
      'store hours',
      'age requirement',
      'product availability'
    ],
    restrictions: [
      'Must be 21+',
      'Valid ID required',
      'No returns on opened tobacco products'
    ]
  }
};
