import { useState, useEffect } from 'react';
import { configApi } from '@/apis/api';

/**
 * Hook to fetch public application configuration from the backend.
 */
export function useAppConfig() {
  const [oidcEnabled, setOidcEnabled] = useState<boolean>(false);
  const [emailEnabled, setEmailEnabled] = useState<boolean>(false);
  const [demoEnabled, setDemoEnabled] = useState<boolean>(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    configApi.getConfig()
      .then((config) => {
        if (isMounted) {
          setOidcEnabled(config.oidcEnabled);
          setEmailEnabled(config.emailEnabled);
          setDemoEnabled(config.demoEnabled);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch app config:', err);
        if (isMounted) {
          // Default to false if fetch fails
          setOidcEnabled(false);
          setEmailEnabled(false);
          setDemoEnabled(false);
        }
      })
      .finally(() => {
        if (isMounted) {
          setConfigLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { oidcEnabled, emailEnabled, demoEnabled, configLoading };
}
