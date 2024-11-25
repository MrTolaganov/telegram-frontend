import { IContact } from '@/types'
import { create } from 'zustand'

type Store = {
  step: 'login' | 'verify'
  setStep: (step: 'login' | 'verify') => void
  email: string
  setEmail: (email: string) => void
  onlineContacts: IContact[]
  setOnlineContacts: (onlineContacts: IContact[]) => void
}

export const useAuth = create<Store>()(set => ({
  step: 'login',
  setStep: step => set({ step }),
  email: '',
  setEmail: email => set({ email }),
  onlineContacts: [],
  setOnlineContacts: onlineContacts => set({ onlineContacts }),
}))
