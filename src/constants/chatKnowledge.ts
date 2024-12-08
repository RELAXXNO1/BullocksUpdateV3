import { ChatKnowledge } from '../types/chat';

export const PREDEFINED_KNOWLEDGE: ChatKnowledge = {
  'products': `The Products section allows you to:
• Add, edit, and delete products
• Manage product categories and attributes
• Upload and watermark product images
• Set pricing and inventory
• Control product visibility`,

  'categories': `Category management features include:
• Custom category creation
• Category-specific attributes
• Product organization
• Category visibility controls
• Bulk category updates`,

  'content': `Store Content management includes:
• Hero section customization
• Product listing layouts
• Custom page creation
• Content scheduling
• SEO optimization tools`,

  'analytics': `The Dashboard provides:
• Real-time sales analytics
• Product view tracking
• Category performance metrics
• Customer behavior insights
• Conversion tracking`,

  'premium': `Premium AI features available with Bullocks AI Pro:
• AI Product Management
• AI Photo Enhancement
• Store AI Assistant
• Advanced Analytics AI

Contact Travis at +1 (330) 327-3343 to unlock these features!`,

  'help': `I can help you with:
• Product and category management
• Content editing
• Analytics and reporting
• Premium feature information

What would you like to know more about?`,

  'development': `Total Development Time: 441 hours and 26 minutes

This includes:
• Initial planning and architecture
• UI/UX design and implementation
• Backend integration
• Testing and optimization
• Security implementation
• Documentation`
};

export const PRO_FEATURES = {
  'ai_product_management': {
    name: 'AI Product Management',
    description: 'Autonomous product optimization, inventory forecasting, and pricing strategies.',
    features: [
      'Smart inventory management',
      'Dynamic pricing optimization',
      'Automated product descriptions',
      'Sales trend analysis',
      'Product performance predictions'
    ]
  },
  'photo_optimization': {
    name: 'AI Photo Enhancement',
    description: 'Advanced image processing and optimization tools.',
    features: [
      'Automatic background removal',
      'Product photo enhancement',
      'Batch processing capabilities',
      'Custom watermark positioning',
      'Image quality optimization'
    ]
  },
  'store_ai': {
    name: 'Store AI Assistant',
    description: 'AI-powered customer service and store management.',
    features: [
      '24/7 customer support',
      'Product recommendations',
      'Inventory alerts',
      'Customer behavior analysis',
      'Automated email responses'
    ]
  },
  'analytics_ai': {
    name: 'Advanced Analytics AI',
    description: 'Deep insights and predictive analytics.',
    features: [
      'Sales forecasting',
      'Customer segmentation',
      'Trend prediction',
      'ROI analysis',
      'Custom reporting'
    ]
  }
};