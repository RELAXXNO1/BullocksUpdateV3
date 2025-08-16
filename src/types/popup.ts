export interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  isActive: boolean;
  displayRule: 'always' | 'oncePerSession' | 'oncePerUser';
  adLocation: 'popup' | 'overStorePage' | 'belowFooter' | 'miniModule'; // New field for ad location
  startDate?: number; // Unix timestamp
  endDate?: number; // Unix timestamp
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}
