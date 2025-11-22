import DashboardHeader from '@/components/layout/dashboard-header';
import { vaultApi } from '@/apis/api';
import CreateVaultModal from '@/components/modals/create-vault-modal';
import EditVaultModal from '@/components/modals/edit-vault-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVaultStore } from '@/stores/vault-store';
import type { VaultLite } from '@lwshen/vault-hub-ts-fetch-client';
import {
  AlertCircle,
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
    if (error) {
      return (
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="p-6">
            <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Failed to load vaults</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => {
                  toast.info('Retrying to load vaults...');
                  fetchVaults();
                }}>Try Again</Button>
              </div>
            </div>
          </Card>
        </main>
      );
    }

    return (
      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <Card className="p-6">
            <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading vaults...</p>
            </div>
          </Card>
        ) : vaults.length === 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">No vaults found</h3>
                <p className="text-muted-foreground mb-4">Create your first vault to get started</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Vault
                </Button>
              </div>
            </div>
          </Card>
        ) : (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewVaultValue(vault)}
                        title="View Value"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="mt-6">
                {/* Controls - responsive layout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">per page</span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Showing {((pageIndex - 1) * pageSize) + 1}-{Math.min(pageIndex * pageSize, totalCount)} of {totalCount} vaults
                  </p>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(pageIndex - 1)}
                            className={pageIndex <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pageIndex <= 3) {
                            pageNum = i + 1;
                          } else if (pageIndex >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = pageIndex - 2 + i;
                          }

                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNum)}
                                isActive={pageIndex === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(pageIndex + 1)}
                            className={pageIndex >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedVault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirmOpen(false)} />
          <Card className="relative z-10 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-xl">Delete Vault</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete the vault <span className="font-medium">{selectedVault.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteVault}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
