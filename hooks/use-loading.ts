import { IContact } from '@/types'
import { create } from 'zustand'

type Store = {
  isCreating: boolean
  isLoading: boolean
  isLoadingMsgs: boolean
  typing: { sender: IContact | null; message: string }
  setTyping: (typing: { sender: IContact | null; message: string }) => void

  setIsCreating: (isCreating: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  setIsLoadingMsgs: (isLoadingMsgs: boolean) => void
}

export const useLoading = create<Store>(set => ({
  isCreating: false,
  isLoading: false,
  isLoadingMsgs: false,
  typing: { sender: null, message: '' },
  setTyping: typing => set({ typing }),
  setIsCreating: isCreating => set({ isCreating }),
  setIsLoading: isLoading => set({ isLoading }),
  setIsLoadingMsgs: isLoadingMsgs => set({ isLoadingMsgs }),
}))
