import { auditApi, statusApi } from '@/apis/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useVaultStore } from '@/stores/vault-store';
import { getStatusColor, getStatusText } from '@/utils/status-utils';
import type { AuditLog, AuditMetricsResponse, StatusResponse, VaultLite } from '@lwshen/vault-hub-ts-fetch-client';
import { formatTimestamp, getActionTitle, getIconForAction } from '@/utils/audit-log';
import {
  Activity,
  Key,
  Loader2,
  Lock,
  Star,
  Users,
  Vault,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function DashboardContent() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [metrics, setMetrics] = useState<AuditMetricsResponse | null>(null);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const { vaults, isLoading: vaultsLoading, fetchVaults } = useVaultStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch status information using the API client
        const statusResponse = await statusApi.getStatus();
        setStatus(statusResponse);
        const metricsResponse = await auditApi.getAuditMetrics();
        setMetrics(metricsResponse);
        // Fetch recent audit logs (first 5 items from page 1)
        const auditResponse = await auditApi.getAuditLogs(5, 1);
        setRecentAuditLogs(auditResponse.auditLogs || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchVaults();
  }, [fetchVaults]);

  // Get recent vaults (sorted by updatedAt, limit to 4)
  const recentVaults = vaults
    .filter(vault => vault.updatedAt && !isNaN(new Date(vault.updatedAt).getTime()))
    .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
    .slice(0, 4);

  const handleViewVaultValue = (vault: VaultLite) => {
    navigate(`/dashboard/vaults/${vault.uniqueId}`);
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-card border-b border-border p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your vaults and monitor activity
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Events (30 days)"
            value={metrics?.totalEventsLast30Days?.toString() || '-'}
            icon={Activity}
            subtitle="Last 30 days"
            iconColor="text-blue-500"
            isLoading={loading}
          />
          <StatCard
            title="Events (24 hours)"
            value={metrics?.eventsCountLast24Hours?.toString() || '-'}
            icon={Users}
            subtitle="Last 24 hours"
            iconColor="text-orange-500"
            isLoading={loading}
          />
          <StatCard
            title="Vault Events (30 days)"
            value={metrics?.vaultEventsLast30Days?.toString() || '-'}
            icon={Vault}
            subtitle="Last 30 days"
            iconColor="text-green-500"
            isLoading={loading}
          />
          <StatCard
            title="API Key Events (30 days)"
            value={metrics?.apiKeyEventsLast30Days?.toString() || '-'}
            icon={Key}
            subtitle="Last 30 days"
            iconColor="text-cyan-500"
            isLoading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Vaults */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Vaults</h2>
            </div>
            <div className="space-y-3">
              {vaultsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading vaults...</span>
                </div>
              ) : recentVaults.length > 0 ? (
                recentVaults.map((vault) => (
                  <div key={vault.uniqueId} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{vault.name}</p>
                          {vault.favourite && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                              <Star className="h-3 w-3 mr-1" />
                              Favourite
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {vault.category && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                              {vault.category}
                            </span>
                          )}
                          {vault.updatedAt && (
                            <span>Updated {formatTimestamp(vault.updatedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVaultValue(vault)}
                    >
                      Access
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <Vault className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No vaults found</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* System Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Status</span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 ${getStatusColor(status?.systemStatus)} rounded-full`}></div>
                  <span className="text-sm text-muted-foreground">{getStatusText(status?.systemStatus)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 ${getStatusColor(status?.databaseStatus)} rounded-full`}></div>
                  <span className="text-sm text-muted-foreground">{getStatusText(status?.databaseStatus)}</span>
                </div>
              </div>
              {status && (
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Version</span>
                    <span className="text-sm text-muted-foreground">{status.version}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium">Commit</span>
                    <span className="text-sm text-muted-foreground font-mono">{status.commit}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Audit Logs */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Audit Logs</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading recent audit logs...</span>
              </div>
            ) : recentAuditLogs.length > 0 ? (
              recentAuditLogs.map((log) => {
                const { icon: ActionIcon, color } = getIconForAction(log.action);
                const actionTitle = getActionTitle(log.action);
                const resourceName = log.vault?.name || log.apiKey?.name;
                const uniqueKey = `${log.action}-${log.createdAt}-${log.vault?.uniqueId || log.apiKey?.id || 'user'}`;
                return (
                  <div key={uniqueKey} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <ActionIcon className={`h-4 w-4 ${color}`} />
                    <div className="flex-1">
                      <p className="font-medium">
                        {actionTitle}{resourceName && ` (${resourceName})`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.apiKey ? 'via API Key' : 'via Web UI'} • {formatTimestamp(log.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-8 text-center">
                <div>
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent audit logs</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>

    </>
  );
}
