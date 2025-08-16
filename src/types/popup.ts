export interface Popup {
  id: string;
  title: string;
  content: string; // Can be plain text or HTML
  imageUrl?: string;
  isActive: boolean;

  // --- Behavior & Display Rules ---
  displayRule: 'always' | 'oncePerSession' | 'oncePerUser';
  displayTriggers: {
    type: 'onLoad' | 'onScroll' | 'onExitIntent';
    delaySeconds?: number; // For 'onLoad'
    scrollPercentage?: number; // For 'onScroll'
  }[];
  adLocation: 'popup' | 'overStorePage' | 'belowFooter' | 'miniModule';
  priority: number; // e.g., 1-100, determines which popup shows if multiple are active
  targetDevice: 'all' | 'desktop' | 'mobile';

  // --- Scheduling ---
  schedule?: {
    startDate?: number; // Unix timestamp
    endDate?: number;   // Unix timestamp
  };

  // --- Appearance & Styling ---
  appearance: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: 'sm' | 'md' | 'lg' | 'xl' | string; // Allow custom values
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | string; // Allow custom values
    animation?: 'fade' | 'slide' | 'none';
    customCss?: string; // For advanced styling overrides
  };

  // --- Call to Action (CTA) ---
  callToAction?: {
    text: string;
    url: string;
    backgroundColor?: string;
    textColor?: string;
  };

  // --- Analytics & Tracking ---
  userInteractions: {
    views: number;
    clicks: number;
  };
  
  // --- Metadata ---
  metadata?: Record<string, any>; // For storing any other custom data

  // --- Timestamps ---
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}