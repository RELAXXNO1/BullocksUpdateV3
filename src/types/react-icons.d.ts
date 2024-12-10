declare module 'react-icons/fa' {
  import { IconType } from 'react-icons';
  
  export const FaImage: IconType;
  export const FaFolderOpen: IconType;
  export const FaCheckCircle: IconType;
}

declare module 'react-icons' {
  import React from 'react';

  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = React.ComponentType<IconBaseProps>;
}
