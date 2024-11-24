import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Account = {
  id: string
  username: string
  provider: string
  avatar_url: string
  created_at: string
  updated_at: string
}

interface AccountState {
  accounts: Account[]
  selectedAccount: Account | null
  isLoading: boolean
  error: string | null
  fetchAccounts: () => Promise<void>
  setSelectedAccount: (account: Account) => void
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      selectedAccount: null,
      isLoading: false,
      error: null,

      fetchAccounts: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/accounts')
          if (!response.ok) throw new Error('Failed to fetch accounts')
          const data = await response.json()
          set({ accounts: data, isLoading: false })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      setSelectedAccount: (account) => {
        set({ selectedAccount: account })
      },
    }),
    {
      name: 'account-storage',
      partialize: (state) => ({
        selectedAccount: state.selectedAccount,
      }),
    }
  )
)
