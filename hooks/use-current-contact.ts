import { IContact, IMessage } from '@/types'
import { create } from 'zustand'

type Store = {
  currentContact: IContact | null
  setCurrentContact: (contact: IContact | null) => void
  editedMessage: IMessage | null
  setEditedMessage: (message: IMessage | null) => void
}

export const useCurrentContact = create<Store>()(set => ({
  currentContact: null,
  setCurrentContact: contact => set({ currentContact: contact }),
  editedMessage: null,
  setEditedMessage: editedMessage => set({ editedMessage }),
}))
