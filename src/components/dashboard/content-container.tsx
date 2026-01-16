import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface ContentContainerProps {
  isLoading?: boolean;
  loadingText?: string;
  error?: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
}

export function ContentContainer({
  isLoading = false,
  loadingText = 'Loading...',
  error,
  onRetry,
  isEmpty = false,
  emptyIcon: EmptyIcon,
  emptyTitle = 'No data found',
  emptyMessage,
  emptyAction,
  children,
}: ContentContainerProps) {
  if (error) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="p-6">
          <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Failed to load data</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              {onRetry && <Button onClick={onRetry}>Try Again</Button>}
            </div>
          </div>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="p-6">
          <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{loadingText}</p>
          </div>
        </Card>
      </main>
    );
  }

  if (isEmpty) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="p-6">
          <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
            {EmptyIcon && <EmptyIcon className="h-12 w-12 text-muted-foreground" />}
            <div className="text-center">
              <h3 className="text-lg font-semibold">{emptyTitle}</h3>
              {emptyMessage && <p className="text-muted-foreground mb-4">{emptyMessage}</p>}
              {emptyAction}
            </div>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  );
}
