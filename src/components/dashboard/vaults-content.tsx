import { ContentContainer } from '@/components/dashboard/content-container';
import { PaginationControls } from '@/components/dashboard/pagination-controls';
import DashboardHeader from '@/components/layout/dashboard-header';
import { vaultApi } from '@/apis/api';
import CreateVaultModal from '@/components/modals/create-vault-modal';
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal';
import EditVaultModal from '@/components/modals/edit-vault-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useVaultStore } from '@/stores/vault-store';
import type { VaultLite } from '@lwshen/vault-hub-ts-fetch-client';
import {
  Edit,
  Eye,
  Key,
  Loader2,
  Lock,
  Star,
  StarOff,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function VaultsContent() {
  const {
    vaults,
    isLoading,
    error,
    isDeleting,
    fetchVaults,
    deleteVault,
    totalCount,
    totalPages,
    pageSize,
    pageIndex,
    setPageIndex,
    setPageSize,
  } = useVaultStore();

  const [, navigate] = useLocation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<VaultLite | null>(null);
  const [favouriteUpdatingId, setFavouriteUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  const handleVaultCreated = () => {
    toast.success('Vault created successfully');
    fetchVaults(); // Refresh the vault list after creation
  };

  const handleEditVault = (vault: VaultLite) => {
    setSelectedVault(vault);
    setIsEditModalOpen(true);
  };

  const handleViewVaultValue = (vault: VaultLite) => {
    navigate(`/dashboard/vaults/${vault.uniqueId}`);
  };

  const handleEditVaultValue = (vault: VaultLite) => {
    navigate(`/dashboard/vaults/${vault.uniqueId}?mode=edit`);
  };

  const handleDeleteVault = (vault: VaultLite) => {
    setSelectedVault(vault);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteVault = async () => {
    if (!selectedVault) return;

    try {
      await deleteVault(selectedVault.uniqueId);
      setDeleteConfirmOpen(false);
      toast.success(`Vault "${selectedVault.name}" has been deleted successfully`);
    } catch (err) {
      console.error('Failed to delete vault:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vault';
      toast.error(`Failed to delete vault: ${errorMessage}`);
    }
  };

  const handleVaultUpdated = () => {
    toast.success('Vault updated successfully');
    fetchVaults(); // Refresh the vault list after update
  };

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setPageSize(size);
  };

  const handleToggleFavourite = async (vault: VaultLite) => {
    setFavouriteUpdatingId(vault.uniqueId);
    try {
      await vaultApi.updateVault(vault.uniqueId, { favourite: !vault.favourite });
      toast.success(
        `Vault "${vault.name}" ${vault.favourite ? 'removed from favourites' : 'added to favourites'}`,
      );
      fetchVaults();
    } catch (err) {
      console.error('Failed to update favourite status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update favourite status';
      toast.error(errorMessage);
    } finally {
      setFavouriteUpdatingId(null);
    }
  };

  const renderContent = () => {
    return (
      <ContentContainer
        isLoading={isLoading}
        loadingText="Loading vaults..."
        error={error}
        onRetry={() => {
          toast.info('Retrying to load vaults...');
          fetchVaults();
        }}
        isEmpty={vaults.length === 0}
        emptyIcon={Lock}
        emptyTitle="No vaults found"
        emptyMessage="Create your first vault to get started"
        emptyAction={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Vault
          </Button>
        }
      >
        <>
          <div className="grid gap-4">
            {vaults.map((vault) => (
              <Card key={vault.uniqueId} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Lock className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{vault.name}</h3>
                        {vault.favourite && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                            <Star className="h-3.5 w-3.5 mr-1" />
                            Favourite
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {vault.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            {vault.category}
                          </span>
                        )}
                        {vault.description && <span>{vault.description}</span>}
                        {vault.updatedAt && (
                          <span>Last Updated {new Date(vault.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVaultValue(vault)}
                          title="View Value"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View value</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={vault.favourite ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleFavourite(vault)}
                          title={vault.favourite ? 'Remove from favourites' : 'Mark as favourite'}
                          disabled={favouriteUpdatingId === vault.uniqueId}
                        >
                          {favouriteUpdatingId === vault.uniqueId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : vault.favourite ? (
                            <Star className="h-4 w-4 text-amber-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {vault.favourite ? 'Remove from favourites' : 'Mark as favourite'}
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditVaultValue(vault)}>
                          <Key className="h-4 w-4" />
                          Edit Value
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditVault(vault)}>
                          <Edit className="h-4 w-4" />
                          Edit Properties
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteVault(vault)}
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Vault
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <PaginationControls
            currentPage={pageIndex}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            itemLabel="vaults"
          />
        </>
      </ContentContainer>
    );
  };

  return (
    <>
      <DashboardHeader
        title="Vaults"
        description="Manage and organize your secret vaults"
        actions={
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Vault
          </Button>
        }
      />
      {renderContent()}

      <CreateVaultModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onVaultCreated={handleVaultCreated}
      />

      <EditVaultModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        vault={selectedVault}
        onVaultUpdated={handleVaultUpdated}
      />

      <DeleteConfirmationModal
        open={deleteConfirmOpen && selectedVault !== null}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Vault"
        description={`Are you sure you want to delete the vault "${selectedVault?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteVault}
        isDeleting={isDeleting}
      />
    </>
  );
}
