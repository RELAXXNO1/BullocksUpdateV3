export type FormStep = 
  | 'category' 
  | 'details' 
  | 'images';

export interface CategoryConfig {
  slug: string;
  name: string;
  description: string;
  attributes?: {
    fields: {
      name: string;
      label: string;
      type: string;
      required?: boolean;
    }[];
  };
}
