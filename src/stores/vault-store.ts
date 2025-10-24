import { vaultApi } from '@/apis/api';
import type { VaultLite, VaultsResponse } from '@lwshen/vault-hub-ts-fetch-client';
import { create } from 'zustand';

// Constants
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_INDEX = 1;

/**
 * Validates that the API response contains a valid vaults array.
 * This is the only runtime validation needed since other fields are required by TypeScript.
 *
 * @param response - The API response to validate
 * @throws Error if the response structure is invalid
 */
function validateVaultsResponse(response: VaultsResponse): void {
  if (!Array.isArray(response.vaults)) {
    throw new Error(
      `Invalid API response: expected 'vaults' to be an array, but received ${typeof response.vaults}`,
    );
  }
}

/**
 * Represents the state of the vault store
 */
interface VaultState {
  /** List of vaults for the current page */
  vaults: VaultLite[];
  /** Whether vaults are currently being fetched */
  isLoading: boolean;
  /** Error message if fetch or delete operation fails */
  error: string | null;
  /** Whether a vault deletion is in progress */
  isDeleting: boolean;
  /** Total number of vaults across all pages */
  totalCount: number;
  /** Total number of pages based on pageSize */
  totalPages: number;
  /** Number of vaults to display per page */
  pageSize: number;
  /** Current page index (1-based) */
  pageIndex: number;
}

/**
 * Available actions for the vault store
 */
interface VaultActions {
  /**
   * Fetches vaults from the API with optional pagination parameters
   * @param pageIndex - Optional page index (defaults to current pageIndex)
   * @param pageSize - Optional page size (defaults to current pageSize)
   */
  fetchVaults: (pageIndex?: number, pageSize?: number) => Promise<void>;
  /**
   * Deletes a vault and refreshes the vault list
   * @param uniqueId - The unique identifier of the vault to delete
   */
  deleteVault: (uniqueId: string) => Promise<void>;
  /**
   * Updates the current page index and fetches vaults for that page
   * @param pageIndex - The new page index to navigate to
   */
  setPageIndex: (pageIndex: number) => void;
  /**
   * Updates the page size and resets to page 1
   * @param pageSize - The new number of vaults per page
   */
  setPageSize: (pageSize: number) => void;
  /** Clears any error message */
  clearError: () => void;
  /** Resets the store to its initial state */
  reset: () => void;
}

type VaultStore = VaultState & VaultActions;

const initialState: VaultState = {
  vaults: [],
  isLoading: true,
  error: null,
  isDeleting: false,
  totalCount: 0,
  totalPages: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  pageIndex: DEFAULT_PAGE_INDEX,
};

/**
 * Zustand store for managing vault state and operations.
 *
 * Provides state management for:
 * - Fetching and displaying paginated vaults
 * - Deleting vaults
 * - Managing pagination (page size and index)
 * - Tracking loading and error states
 *
 * @example
 * ```tsx
 * function VaultsList() {
 *   const { vaults, fetchVaults, isLoading } = useVaultStore();
 *
 *   useEffect(() => {
 *     fetchVaults();
 *   }, [fetchVaults]);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   return <div>{vaults.map(v => <VaultCard key={v.uniqueId} vault={v} />)}</div>;
 * }
 * ```
 */
export const useVaultStore = create<VaultStore>((set, get) => ({
  ...initialState,

  fetchVaults: async (pageIndex?: number, pageSize?: number) => {
    set({ isLoading: true, error: null });

    const currentState = get();
    const requestPageIndex = pageIndex ?? currentState.pageIndex;
    const requestPageSize = pageSize ?? currentState.pageSize;

    try {
      const response = await vaultApi.getVaults(requestPageSize, requestPageIndex);

      // Validate response structure
      validateVaultsResponse(response);

      set({
        vaults: response.vaults,
        totalCount: response.totalCount,
        totalPages: Math.ceil(response.totalCount / response.pageSize),
        pageSize: response.pageSize,
        pageIndex: response.pageIndex,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'An unexpected error occurred while fetching vaults',
        vaults: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteVault: async (uniqueId: string) => {
    set({ isDeleting: true });

    try {
      await vaultApi.deleteVault(uniqueId);
      // Refetch vaults after deletion
      const currentState = get();
      await get().fetchVaults(currentState.pageIndex, currentState.pageSize);
    } finally {
      set({ isDeleting: false });
    }
  },

  setPageIndex: (pageIndex: number) => {
    set({ pageIndex });
    get().fetchVaults(pageIndex);
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, pageIndex: DEFAULT_PAGE_INDEX });
    get().fetchVaults(DEFAULT_PAGE_INDEX, pageSize);
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
