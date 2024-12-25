export interface StoreContent {
  id: string;
  section: 'hero' | 'about' | 'products' | 'custom';
  title: string;
  description: string;
  isVisible: boolean;
  order?: number;
  lastUpdated: number;
  images?: string[];
}

export interface StoreContentUpdateDTO {
  title?: string;
  description?: string;
  isVisible?: boolean;
  order?: number;
  images?: string[];
}
