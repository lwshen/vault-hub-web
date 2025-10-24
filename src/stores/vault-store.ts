import { vaultApi } from '@/apis/api';
import type { VaultLite } from '@lwshen/vault-hub-ts-fetch-client';
import { create } from 'zustand';

interface VaultState {
  vaults: VaultLite[];
  isLoading: boolean;
  error: string | null;
  isDeleting: boolean;
  totalCount: number;
  totalPages: number;
  pageSize: number;
  pageIndex: number;
}

interface VaultActions {
  fetchVaults: (pageIndex?: number, pageSize?: number) => Promise<void>;
  deleteVault: (uniqueId: string) => Promise<void>;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  clearError: () => void;
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
  pageSize: 10,
  pageIndex: 1,
};

export const useVaultStore = create<VaultStore>((set, get) => ({
  ...initialState,

  fetchVaults: async (pageIndex?: number, pageSize?: number) => {
    set({ isLoading: true, error: null });

    const currentState = get();
    const requestPageIndex = pageIndex ?? currentState.pageIndex;
    const requestPageSize = pageSize ?? currentState.pageSize;

    try {
      const response = await vaultApi.getVaults(requestPageSize, requestPageIndex);
      set({
        vaults: response.vaults,
        totalCount: response.totalCount,
        totalPages: Math.ceil(response.totalCount / response.pageSize),
        pageSize: response.pageSize,
        pageIndex: response.pageIndex,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch vaults',
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
    set({ pageSize, pageIndex: 1 });
    get().fetchVaults(1, pageSize);
  },

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));
