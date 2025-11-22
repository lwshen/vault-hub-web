import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, Star } from 'lucide-react';
import type { Vault } from '@lwshen/vault-hub-ts-fetch-client';

interface VaultMetadataProps {
  vault: Vault;
}

export function VaultMetadata({ vault }: VaultMetadataProps) {
  const isFavourite = Boolean(vault.favourite);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Eye className="h-5 w-5" />
          {vault.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Favourite
            </Label>
            <div
              className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                isFavourite
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Star
                className={`h-4 w-4 ${
                  isFavourite
                    ? 'text-amber-600 dark:text-amber-200'
                    : 'text-muted-foreground'
                }`}
              />
              {isFavourite ? 'Marked as favourite' : 'Not marked as favourite'}
            </div>
          </div>
          {vault.category && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Category
              </Label>
              <p className="mt-1 text-sm font-medium">{vault.category}</p>
            </div>
          )}
          {vault.description && (
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Description
              </Label>
              <p className="mt-1 text-sm">{vault.description}</p>
            </div>
          )}
          {vault.updatedAt && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Last Updated
              </Label>
              <p className="mt-1 text-sm">
                {new Date(vault.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
