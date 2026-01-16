import { PaginationControls } from '@/components/dashboard/pagination-controls';
import DashboardHeader from '@/components/layout/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/dashboard/stat-card.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuditLogStore } from '@/stores/audit-store';
import { formatTimestamp, getActionTitle, getIconForAction } from '@/utils/audit-log';
import {
  Activity,
  AlertCircle,
  Filter,
  Key,
  Loader2,
  Lock,
  X,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';

export default function AuditLogContent() {
  const {
    auditLogs,
    metrics,
    vaultFilterOptions,
    isLoading,
    metricsLoading,
    error,
    currentPage,
    totalCount,
    totalPages,
    pageSize,
    vaultFilter,
    sourceFilter,
    fetchMetrics,
    fetchAuditLogs,
    fetchVaultFilterOptions,
    setPageSize,
    setCurrentPage,
    setVaultFilter,
    setSourceFilter,
    clearFilters,
  } = useAuditLogStore();

  useEffect(() => {
    fetchMetrics();
    fetchAuditLogs(1);
    fetchVaultFilterOptions(); // Fetch vault filter options
  }, [fetchMetrics, fetchAuditLogs, fetchVaultFilterOptions]);

  // Prepare vault options for combobox
  const vaultOptions = useMemo(() => {
    const options = vaultFilterOptions.map((vault) => ({
      value: vault.uniqueId,
      label: vault.name,
    }));
    return [{ value: '', label: 'All Vaults' }, ...options];
  }, [vaultFilterOptions]);

  // Check if any filters are active
  const hasActiveFilters = vaultFilter !== null || sourceFilter !== 'all';

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setPageSize(size);
  };

  const renderContent = () => {
    if (error) {
      return (
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="p-6">
            <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Failed to load audit logs</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => fetchAuditLogs(currentPage)}>Try Again</Button>
              </div>
            </div>
          </Card>
        </main>
      );
    }

    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Audit Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <StatCard
              title="Total Events"
              value={metrics?.totalEventsLast30Days?.toLocaleString() || '-'}
              icon={Activity}
              subtitle="Last 30 days"
              iconColor="text-blue-500"
              isLoading={metricsLoading}
            />
            <StatCard
              title="Last 24 Hours"
              value={metrics?.eventsCountLast24Hours?.toLocaleString() || '-'}
              icon={Activity}
              subtitle="Recent audit logs"
              iconColor="text-orange-500"
              isLoading={metricsLoading}
            />
            <StatCard
              title="Vault Events"
              value={metrics?.vaultEventsLast30Days?.toLocaleString() || '-'}
              icon={Lock}
              subtitle="Last 30 days"
              iconColor="text-green-500"
              isLoading={metricsLoading}
            />
            <StatCard
              title="API Key Events"
              value={metrics?.apiKeyEventsLast30Days?.toLocaleString() || '-'}
              icon={Key}
              subtitle="Last 30 days"
              iconColor="text-cyan-500"
              isLoading={metricsLoading}
            />
          </div>

          {/* Audit List */}
          <Card className="p-6">
            <div className="mb-4">
              {/* Header with title */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Audit Logs</h3>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <Combobox
                    options={vaultOptions}
                    value={vaultFilter || ''}
                    onValueChange={(value) => setVaultFilter(value || null)}
                    placeholder="All Vaults"
                    searchPlaceholder="Search vaults..."
                    emptyText="No vault found."
                    className="w-full sm:w-[200px] !font-normal"
                  />
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="web">Web UI</SelectItem>
                      <SelectItem value="cli">CLI/API</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="w-full sm:w-auto"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Controls - responsive layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

                {totalCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} events
                  </p>
                )}
              </div>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading audit logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="flex items-center justify-center min-h-[200px] flex-col gap-4">
                <Activity className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No audit logs found</h3>
                  <p className="text-muted-foreground">No activity has been recorded yet.</p>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden sm:table-cell">Resource</TableHead>
                      <TableHead className="hidden md:table-cell">Method</TableHead>
                      <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((audit) => {
                      const { icon: Icon, color } = getIconForAction(audit.action);
                      return (
                        <TableRow key={`${audit.action}-${audit.createdAt}`}>
                          <TableCell>
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{getActionTitle(audit.action)}</span>
                              <span className="text-xs text-muted-foreground sm:hidden">
                                {audit.vault && `Vault: ${audit.vault.name}`}
                                {audit.apiKey && `API Key: ${audit.apiKey.name}`}
                                {!audit.vault && !audit.apiKey && 'User Account'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {audit.vault && (
                              <div className="flex flex-col">
                                <span className="font-medium">{audit.vault.name}</span>
                                <span className="text-xs text-muted-foreground">{audit.vault.uniqueId}</span>
                              </div>
                            )}
                            {audit.apiKey && (
                              <div className="flex flex-col">
                                <span className="font-medium">{audit.apiKey.name}</span>
                                <span className="text-xs text-muted-foreground">ID: {audit.apiKey.id}</span>
                              </div>
                            )}
                            {!audit.vault && !audit.apiKey && (
                              <span className="text-muted-foreground">User Account</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {audit.apiKey ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className={'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help bg-muted text-muted-foreground'}>
                                    CLI/API
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p>API Key: {audit.apiKey.name}</p>
                                    <p className={`text-sm ${
                                      audit.apiKey.isActive
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                      Status: {audit.apiKey.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                    {!audit.apiKey.isActive && (
                                      <p className="text-xs text-orange-600 dark:text-orange-400">
                                        This API key was deleted
                                      </p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                Web UI
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {audit.ipAddress || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">{formatTimestamp(audit.createdAt, true)}</span>
                              <span className="text-xs text-muted-foreground lg:hidden">
                                {audit.ipAddress && `IP: ${audit.ipAddress}`}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <PaginationControls
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  itemLabel="events"
                />
              </>
            )}
          </Card>
        </div>
      </main>
    );
  };

  return (
    <>
      <DashboardHeader
        title="Audit Log"
        description="Monitor audit logs"
      />
      {renderContent()}
    </>
  );
}
