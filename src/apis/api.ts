import { PATH } from '@/const/path';
import { AuditApi, AuthApi, ConfigApi, Configuration, UserApi, VaultApi, APIKeyApi, StatusApi, type ResponseContext } from '@lwshen/vault-hub-ts-fetch-client';
import { navigate } from 'wouter/use-browser-location';

interface ApiError extends Error {
  status: number;
  statusText: string;
}

let isNavigatingToLogin = false;
function debounceNavigateToLogin() {
  if (!isNavigatingToLogin) {
    isNavigatingToLogin = true;
    navigate(PATH.LOGIN);
    // Optionally, reset the flag after a short delay if needed:
    setTimeout(() => {
      isNavigatingToLogin = false;
    }, 1000);
  }
}

const config = new Configuration({
  basePath: '',
  middleware: [
    {
      pre: async (context) => {
        const token = localStorage.getItem('token');
        if (token) {
          context.init.headers = {
            ...context.init.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      },
      post: async (context: ResponseContext) => {
        const { response } = context;

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            const errorBody = await response.clone().text();
            if (errorBody) {
              try {
                const errorJson = JSON.parse(errorBody);
                const explicitMessage =
                  errorJson?.error?.message || errorJson?.message || errorJson?.error;
                const retryAfterHeader = response.headers.get('Retry-After');

                if (explicitMessage) {
                  errorMessage = explicitMessage;
                } else if (errorJson?.code) {
                  switch (errorJson.code) {
                    case 'email_token_rate_limited': {
                      let waitLabel = 'a moment';
                      if (retryAfterHeader) {
                        const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10);
                        if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
                          waitLabel = `${retryAfterSeconds} seconds`;
                        }
                      }
                      errorMessage = `Too many password reset requests. Try again in ${waitLabel}.`;
                      break;
                    }
                    default:
                      errorMessage = typeof errorJson.code === 'string' ? errorJson.code : errorMessage;
                  }
                }
              } catch {
                errorMessage = errorBody || errorMessage;
              }
            }
          } catch {
            // Fall back to status text if body parsing fails
          }

          const error = new Error(errorMessage) as ApiError;
          switch (response.status) {
            case 401:
              debounceNavigateToLogin();
              break;
            default:
          }
          throw error;
        }

        return response;
      },
    },
  ],
});

const authApi = new AuthApi(config);
const userApi = new UserApi(config);
const vaultApi = new VaultApi(config);
const auditApi = new AuditApi(config);
const apiKeyApi = new APIKeyApi(config);
const statusApi = new StatusApi(config);
const configApi = new ConfigApi(config);

export { auditApi, authApi, userApi, vaultApi, apiKeyApi, statusApi, configApi };
