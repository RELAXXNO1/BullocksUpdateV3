import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'neon';
  interactive?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  gradient?: boolean;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

const cardVariants = {
  default: `
    rounded-2xl 
    border 
    bg-white 
    dark:bg-dark-700 
    border-gray-200 
    dark:border-dark-500 
    shadow-md 
    dark:shadow-dark-600/50
  `,
  elevated: `
    rounded-3xl 
    border-2 
    bg-white 
    dark:bg-dark-800 
    border-transparent 
    shadow-2xl 
    dark:shadow-dark-700/60 
    hover:shadow-3xl 
    transition-shadow 
    duration-500
  `,
  glass: `
    rounded-2xl 
    bg-white/60 
    dark:bg-dark-700/40 
    backdrop-blur-xl 
    border 
    border-white/20 
    dark:border-dark-500/30 
    shadow-lg 
    dark:shadow-dark-600/30
  `,
  neon: `
    rounded-2xl 
    bg-white 
    dark:bg-dark-800 
    border-2 
    border-transparent 
    shadow-2xl 
    ring-4 
    ring-transparent 
    hover:ring-primary-500/30 
    hover:border-primary-500/50 
    transition-all 
    duration-500
  `
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default', 
  interactive = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className={`
        relative 
        overflow-hidden 
        ${cardVariants[variant]} 
        ${interactive ? 'cursor-pointer hover:scale-[1.02]' : ''} 
        ${className}
      `}
      whileHover={interactive ? { scale: 1.02 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      {...props}
    >
      {/* Animated Background Effects */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 mix-blend-overlay z-0"
          />
        )}
      </AnimatePresence>

      {/* Dynamic Light Shader */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full 
          bg-gradient-to-br 
          from-white/10 
          via-white/5 
          to-transparent 
          opacity-50 
          dark:opacity-20 
          mix-blend-color-dodge
          animate-pulse-slow
        "></div>
      </div>
      
      {/* Card Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  icon, 
  className = '', 
  ...props 
}) => (
  <div 
    className={`
      flex 
      items-center 
      space-x-4 
      p-6 
      bg-gray-50 
      dark:bg-dark-700 
      border-b 
      border-gray-200 
      dark:border-dark-500 
      transition-colors 
      duration-300 
      ${className}
    `} 
    {...props}
  >
    {icon && <div className="text-primary-500">{icon}</div>}
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  gradient = false, 
  className = '', 
  ...props 
}) => (
  <h3 
    className={`
      text-2xl 
      font-bold 
      leading-tight 
      tracking-tight 
      ${gradient 
        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-transparent bg-clip-text' 
        : 'text-gray-800 dark:text-white'}
      ${className}
    `} 
    {...props}
  >
    {children}
  </h3>
);

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  padded = true, 
  className = '', 
  ...props 
}) => (
  <div 
    className={`
      ${padded ? 'p-6' : ''}
      text-gray-600 
      dark:text-gray-300 
      ${className}
    `} 
    {...props}
  >
    {children}
  </div>
);

// Additional Utility Components
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <div 
    className={`
      p-6 
      bg-gray-50 
      dark:bg-dark-700 
      border-t 
      border-gray-200 
      dark:border-dark-500 
      flex 
      justify-end 
      items-center 
      space-x-4 
      ${className}
    `} 
    {...props}
  >
    {children}
  </div>
);
