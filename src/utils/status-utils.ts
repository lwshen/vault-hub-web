/**
 * Utility functions for status display
 */

export type SystemStatus = 'healthy' | 'degraded' | 'unavailable' | string;

/**
 * Returns the appropriate CSS background color class for a given status
 */
export function getStatusColor(status?: SystemStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'unavailable':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Returns the human-readable text for a given status
 */
export function getStatusText(status?: SystemStatus): string {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'degraded':
      return 'Degraded';
    case 'unavailable':
      return 'Unavailable';
    default:
      return 'Unknown';
  }
}
