import React, { ReactNode } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: {
    href: string;
    label?: string;
  };
  actions?: ReactNode;
  children?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backButton,
  actions,
  children,
}) => {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          {backButton && (
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 h-8 px-2 -ml-2 text-muted-foreground"
              asChild
            >
              <Link href={backButton.href}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                {backButton.label || 'Volver'}
              </Link>
            </Button>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 ml-auto">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};