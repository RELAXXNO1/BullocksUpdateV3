import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { AlertCircle } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&_svg]:h-4 [&_svg]:w-4 [&_svg_path]:stroke-current',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&_svg]:text-destructive',
        success:
          'border-success/50 text-success dark:border-success [&_svg]:text-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  description,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      {children}
      {title && (
        <div className="mb-1 flex items-center font-medium">
          <AlertCircle className="mr-2 h-4 w-4" />
          {title}
        </div>
      )}
      {description && <div className="text-sm opacity-70">{description}</div>}
    </div>
  );
};

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle: React.FC<AlertTitleProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h4
      className={cn('mb-1 font-medium', className)}
      {...props}
    >
      {children}
    </h4>
  );
};

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDescription: React.FC<AlertDescriptionProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('text-sm opacity-70', className)} {...props}>
      {children}
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription };
