import { KnowledgeBase } from '../types/ai';

export const AI_KNOWLEDGE: KnowledgeBase = {
  categories: [
    {
      id: 'products',
      name: 'Product Management',
      description: 'Comprehensive product catalog management system with image handling',
      keywords: ['product', 'inventory', 'stock', 'item', 'catalog', 'price', 'category', 'image', 'visibility'],
      subcategories: ['inventory', 'pricing', 'categories', 'attributes', 'images'],
      features: [
        'Add/edit/delete products with dynamic attributes',
        'Category management system',
        'Image upload with automatic watermarking',
        'Product visibility controls',
        'Flexible pricing options',
        'Custom category-specific attributes',
        'Bulk product management',
        'Image optimization and storage'
      ],
      capabilities: {
        productForm: {
          fields: ['name', 'description', 'price', 'category', 'imageUrl', 'isVisible', 'attributes'],
          imageHandling: ['upload', 'watermark', 'optimization'],
          validation: ['required fields', 'price format', 'image size']
        },
        categoryManagement: {
          operations: ['create', 'update', 'delete'],
          fields: ['name', 'description', 'attributes']
        }
      },
      relatedCategories: ['inventory', 'content']
    },
    {
      id: 'store_content',
      name: 'Store Content Management',
      description: 'Dynamic store content and section management system',
      keywords: ['content', 'sections', 'visibility', 'editor', 'store', 'layout'],
      features: [
        'Section-based content management',
        'Visual content editor',
        'Section visibility controls',
        'Real-time content updates',
        'Last update tracking',
        'Section-specific customization'
      ],
      capabilities: {
        contentSections: ['hero', 'products', 'about', 'contact'],
        operations: ['edit', 'toggle visibility', 'update'],
        fields: {
          title: 'Section title text',
          description: 'Detailed section content',
          isVisible: 'Section visibility toggle',
          lastUpdated: 'Timestamp tracking'
        }
      },
      relatedCategories: ['products', 'marketing']
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      description: 'Stock tracking and inventory control',
      keywords: ['stock', 'quantity', 'availability', 'reorder', 'supply'],
      relatedCategories: ['products', 'analytics']
    },
    {
      id: 'customers',
      name: 'Customer Management',
      description: 'Customer relations and service',
      keywords: ['customer', 'client', 'support', 'service', 'feedback'],
      relatedCategories: ['orders', 'analytics']
    },
    {
      id: 'orders',
      name: 'Order Management',
      description: 'Order processing and tracking',
      keywords: ['order', 'purchase', 'transaction', 'shipping', 'delivery'],
      relatedCategories: ['customers', 'products']
    },
    {
      id: 'analytics',
      name: 'Analytics & Reporting',
      description: 'Business insights and reporting',
      keywords: ['report', 'analytics', 'statistics', 'metrics', 'performance'],
      relatedCategories: ['products', 'customers', 'orders']
    }
  ],
  
  rules: [
    {
      id: 'age_verification',
      category: 'products',
      condition: 'Product category contains tobacco or vape',
      action: 'Require age verification',
      priority: 1
    },
    {
      id: 'inventory_alert',
      category: 'inventory',
      condition: 'Product quantity below threshold',
      action: 'Generate low stock alert',
      priority: 2
    },
    {
      id: 'premium_features',
      category: 'system',
      condition: 'Request involves AI features',
      action: 'Check premium status and suggest upgrade if needed',
      priority: 1
    }
  ],

  responses: [
    {
      id: 'product_management',
      category: 'products',
      pattern: '(manage|add|edit|remove).*product',
      response: `The Products section allows you to:
• Add, edit, and delete products
• Manage product categories and attributes
• Upload and watermark product images
• Set pricing and inventory
• Control product visibility`,
      followUp: ['Would you like to know more about product categories?', 'Need help with product images?']
    },
    {
      id: 'inventory_management',
      category: 'inventory',
      pattern: '(stock|inventory|quantity)',
      response: `Inventory management features include:
• Real-time stock tracking
• Low stock alerts
• Automated reorder points
• Stock history and trends
• Inventory value reports`,
      followUp: ['Would you like to set up stock alerts?', 'Need help with inventory reports?']
    }
  ],

  context: {
    storeInfo: {
      name: 'Bullocks Smoke Shop',
      location: 'Multiple locations across the region',
      hours: 'Mon-Sat: 9AM-9PM, Sun: 10AM-6PM',
      contact: {
        phone: '+1 (330) 327-3343',
        email: 'support@bullocksmokeshop.com'
      },
      policies: {
        ageVerification: 'Must be 21 or older to purchase tobacco products',
        returns: '30-day return policy on unused items',
        shipping: 'Free shipping on orders over $50'
      }
    },
    productCategories: ['smoke', 'vape', 'accessories', 'other'],
    commonQueries: [
      'How do I add a new product?',
      'Where can I view sales reports?',
      'How do I manage inventory?',
      'How do I set up product categories?'
    ],
    restrictions: [
      'Age verification required for tobacco products',
      'No shipping to restricted states',
      'Valid ID required for pickup'
    ]
  }
};

export const PRO_FEATURES = {
  'product_management_pro': {
    name: 'Advanced Product Management',
    description: 'Enhanced product management capabilities with AI-powered features.',
    currentFeatures: {
      basic: [
        'Basic product CRUD operations',
        'Simple category management',
        'Single image upload with watermark',
        'Basic product visibility toggle'
      ],
      pro: [
        'Bulk product operations',
        'Advanced category hierarchies',
        'Multi-image support with gallery',
        'Automated SEO optimization',
        'Inventory tracking',
        'Price history tracking',
        'Advanced product analytics'
      ]
    },
    benefits: [
      'Save 5+ hours per week on product management',
      'Increase product visibility by 40%',
      'Reduce manual entry errors by 90%',
      'Streamline inventory processes'
    ],
    upgrade: {
      cta: 'Upgrade to Pro for advanced product management',
      contact: 'Contact Travis at +1 (330) 327-3343 to unlock Pro features'
    }
  }
};

export const LOCKED_FEATURES = {
  'shopping_cart_orders': {
    name: 'Shopping Cart and Orders',
    description: 'Complete order management system',
    preview: 'Currently no order management available',
    benefits: [
      'Process and track customer orders',
      'Manage shopping cart functionality',
      'Handle customer checkout process',
      'Track order history and status'
    ],
    limitations: [
      'No order processing capability',
      'No shopping cart functionality',
      'Manual order tracking required'
    ],
    upgrade: {
      cta: 'Unlock order management capabilities',
      contact: 'Contact Travis at +1 (330) 327-3343'
    }
  },
  'uix_editor': {
    name: 'UIX Editor',
    description: 'Advanced user interface customization',
    preview: 'Using default store interface',
    benefits: [
      'Customize store appearance',
      'Create custom layouts',
      'Modify color schemes',
      'Add custom components'
    ],
    limitations: [
      'Fixed store layout',
      'Default styling only',
      'No custom components'
    ],
    upgrade: {
      cta: 'Unlock UIX customization',
      contact: 'Contact Travis at +1 (330) 327-3343'
    }
  }
};
