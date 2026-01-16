import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  iconColor?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  iconColor = 'text-blue-500',
  isLoading = false,
}: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${iconColor}`} />
        <div>
          <p className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin inline" />
            ) : (
              typeof value === 'number' ? value.toLocaleString() : value
            )}
          </p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
