import { ChatKnowledge } from '../types/chat';

export const PREDEFINED_KNOWLEDGE: ChatKnowledge = {
  'products': `Admin Product Management Guide:
🔹 Product Creation
• Click "Add New Product" in the Products section
• Fill in detailed product information
• Upload high-quality product images
• Set precise inventory and pricing
• Configure product variants if applicable

🔹 Product Editing
• Select product from the product grid
• Modify details, pricing, or inventory
• Update images or descriptions
• Manage product visibility and status

🔹 Best Practices
• Use clear, descriptive product titles
• Include comprehensive product details
• Optimize images for web
• Keep inventory accurate
• Use categories effectively`,

  'categories': `Category Management Essentials:
🔹 Creating Categories
• Navigate to "Categories" in admin panel
• Click "New Category"
• Provide unique name and description
• Set parent category if hierarchical
• Configure display settings

🔹 Category Features
• Create custom attributes
• Control product organization
• Set visibility rules
• Manage category images
• Enable/disable categories dynamically`,

  'content': `Content Management Strategies:
🔹 Store Content Editing
• Access "Content Management" section
• Customize hero banners
• Design product listing layouts
• Create custom landing pages
• Implement SEO optimizations

🔹 Media Management
• Upload and organize media
• Watermark product images
• Compress images for performance
• Create image collections
• Manage media tags and metadata`,

  'analytics': `Advanced Analytics Dashboard:
🔹 Performance Tracking
• Real-time sales monitoring
• Product view and conversion rates
• Customer behavior insights
• Revenue and profit analysis
• Inventory performance metrics

🔹 Reporting Features
• Generate custom reports
• Export data in multiple formats
• Set up automated reporting
• Compare performance periods
• Identify top-performing products`,

  'premium': `Bullocks AI Pro Features:
🔹 AI-Powered Tools
• Intelligent Product Recommendations
• Automated Image Enhancement
• Dynamic Pricing Suggestions
• Customer Behavior Prediction
• Inventory Optimization

Contact: Travis (+1 (330) 327-3343)
Email: support@bullocksstore.com`,

  'help': `Bullocks Admin Support Guide:
• Need help with product management?
• Struggling with content editing?
• Want to understand analytics?
• Curious about AI features?

I'm here to guide you through our admin tools. What specific area would you like assistance with?

Quick Tips:
✅ Always save changes
✅ Use preview before publishing
✅ Keep images high-quality
✅ Maintain consistent branding`,

  'development': `Bullocks Store Development Insights:
🕒 Total Development: 441 hours, 26 minutes

Key Development Milestones:
• Initial Architecture Design
• AI Integration
• Admin Panel Development
• Performance Optimization
• Security Enhancements

Technology Stack:
• React TypeScript
• Tailwind CSS
• Hugging Face AI
• Custom AI Embeddings
• Advanced State Management`,

  'troubleshooting': `Admin Panel Troubleshooting:
🔧 Common Issues & Solutions
• Slow Loading: Clear browser cache
• Image Upload Failures: Check file size/type
• AI Recommendations Not Working: Refresh AI model
• Incorrect Pricing: Verify currency settings
• Missing Products: Check visibility settings

Need More Help?
📞 Support: +1 (330) 327-3343
📧 Email: support@bullocksstore.com`
};

export const PRO_FEATURES = {
  'ai_product_management': {
    name: 'AI Product Management',
    description: 'Autonomous product optimization, inventory forecasting, and pricing strategies.',
    currentFeatures: {
      basic: ['Basic product management'],
      pro: [
        'Smart inventory management',
        'Dynamic pricing optimization',
        'Automated product descriptions',
        'Sales trend analysis',
        'Product performance predictions'
      ]
    },
    benefits: [
      'Optimize product strategy',
      'Reduce manual work',
      'Increase sales potential'
    ],
    upgrade: {
      cta: 'Unlock AI Product Management',
      contact: '+1 (330) 327-3343'
    }
  },
  'photo_enhancement': {
    name: 'AI Photo Enhancement',
    description: 'Advanced image processing and optimization tools.',
    currentFeatures: {
      basic: ['Basic image upload'],
      pro: [
        'Automatic background removal',
        'Product photo enhancement',
        'Batch processing capabilities',
        'Custom watermark positioning',
        'Image quality optimization'
      ]
    },
    benefits: [
      'Professional-quality images',
      'Consistent product presentation',
      'Increased visual appeal'
    ],
    upgrade: {
      cta: 'Enhance Your Photos',
      contact: '+1 (330) 327-3343'
    }
  },
  'store_ai': {
    name: 'Store AI Assistant',
    description: 'AI-powered customer service and store management.',
    currentFeatures: {
      basic: ['Basic AI support'],
      pro: [
        '24/7 customer support',
        'Product recommendations',
        'Inventory alerts',
        'Customer behavior analysis',
        'Automated email responses'
      ]
    },
    benefits: [
      'Improve customer experience',
      'Automate support tasks',
      'Gain customer insights'
    ],
    upgrade: {
      cta: 'Upgrade Store AI',
      contact: '+1 (330) 327-3343'
    }
  },
  'analytics_ai': {
    name: 'Advanced Analytics AI',
    description: 'Deep insights and predictive analytics.',
    currentFeatures: {
      basic: ['Basic reporting'],
      pro: [
        'Sales forecasting',
        'Customer segmentation',
        'Trend prediction',
        'ROI analysis',
        'Custom reporting'
      ]
    },
    benefits: [
      'Data-driven decisions',
      'Understand business performance',
      'Identify growth opportunities'
    ],
    upgrade: {
      cta: 'Unlock Advanced Analytics',
      contact: '+1 (330) 327-3343'
    }
  }
};