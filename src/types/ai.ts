export interface KnowledgeBase {
  categories: KnowledgeCategory[];
  rules: BusinessRule[];
  responses: ResponseTemplate[];
  context: ContextData;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  subcategories?: string[];
  relatedCategories?: string[];
  features?: string[];
  capabilities?: Record<string, unknown>;
}

export interface BusinessRule {
  id: string;
  category: string;
  condition: string;
  action: string;
  priority: number;
}

export interface ResponseTemplate {
  id: string;
  category: string;
  pattern: string;
  response: string;
  followUp?: string[];
}

export interface ContextData {
  storeInfo: StoreInfo;
  productCategories: string[];
  commonQueries: string[];
  restrictions: string[];
}

export interface StoreInfo {
  name: string;
  location: string;
  hours: string;
  contact: {
    phone: string;
    email: string;
  };
  policies: Record<string, string>;
}

export interface AIResponse {
  text: string;
  category?: string;
  confidence: number;
  suggestions?: string[];
  requiresProFeature?: boolean;
  proFeatureId?: string;
}

// Utility type for feature configuration
export type FeatureConfiguration = {
  basic: string[];
  pro: string[];
};
