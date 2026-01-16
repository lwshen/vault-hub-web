import { ContentContainer } from '@/components/dashboard/content-container';
import DashboardHeader from '@/components/layout/dashboard-header';
import CreateApiKeyModal from '@/components/modals/create-api-key-modal';
import { DeleteConfirmationModal } from '@/components/modals/delete-confirmation-modal';
import EditApiKeyModal from '@/components/modals/edit-api-key-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApiKeyStore } from '@/stores/api-key-store';
import type { VaultAPIKey } from '@lwshen/vault-hub-ts-fetch-client';
import { Edit, Key, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';


export default function ApiKeysContent() {
  const {
    apiKeys,
    isLoading,
    error,
    fetchApiKeys,
    deleteApiKey,
  } = useApiKeyStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<VaultAPIKey | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleKeyCreated = () => {
    fetchApiKeys();
  };

  const handleDeleteApiKey = (key: VaultAPIKey) => {
    setSelectedApiKey(key);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteApiKey = async () => {
    if (!selectedApiKey) return;

    setIsDeleting(true);
    try {
      await deleteApiKey(selectedApiKey.id);
      setDeleteConfirmOpen(false);
      toast.success(`API key "${selectedApiKey.name}" has been deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete API key';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    return (
      <ContentContainer
        isLoading={isLoading}
        loadingText="Loading API keys..."
        error={error}
        onRetry={fetchApiKeys}
        isEmpty={apiKeys.length === 0}
        emptyIcon={Key}
        emptyTitle="No API keys"
        emptyMessage="Create your first key to get started"
        emptyAction={
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Key
          </Button>
        }
      >
        <div className="grid gap-4">
          {apiKeys.map((key) => (
            <Card key={key.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Key className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {key.name}
                      {key.isActive === false && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                          Disabled
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span>Created {key.createdAt.toLocaleString()}</span>
                      {key.expiresAt && <span>Expires {key.expiresAt.toLocaleString()}</span>}
                      {key.lastUsedAt && <span>Last Used {key.lastUsedAt.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedApiKey(key);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteApiKey(key)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ContentContainer>
    );
  };

  return (
    <>
      <DashboardHeader
        title="API Keys"
        description="Manage and create API keys"
        actions={
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Key
          </Button>
        }
      />
      {renderContent()}

      <CreateApiKeyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onApiKeyCreated={handleKeyCreated}
      />

      {selectedApiKey && (
        <EditApiKeyModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          apiKey={selectedApiKey}
          onApiKeyUpdated={handleKeyCreated}
        />
      )}

      <DeleteConfirmationModal
        open={deleteConfirmOpen && selectedApiKey !== null}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete API Key"
        description={`Are you sure you want to delete the API key "${selectedApiKey?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteApiKey}
        isDeleting={isDeleting}
      />
    </>
  );
}
