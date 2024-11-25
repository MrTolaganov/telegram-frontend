import { ReactNode } from 'react'

export interface ChildProps {
  children: ReactNode
}

export interface IContact {
  _id: string
  email: string
  verified: boolean
  muted: boolean
  avatar?: string
  firstName?: string
  lastName?: string
  bio?: string
  notificationSound: string
  sendingSound: string
  contacts: IContact[]
  lastMessage: IMessage | null
}

export interface IError {
  response: { data: { message: string } }
}

export interface INotificationPayload {
  notificationSound?: string
  sendingSound?: string
  muted?: boolean
}

export interface ISettingsPayload {
  muted?: boolean
  avatar?: string
}

export interface IMessage {
  _id: string
  text: string
  image: string
  reaction: string
  sender: IContact
  receiver: IContact
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface IGetMessageType {
  message: IMessage
  sender: IContact
  receiver: IContact
}

export interface IExtendedGetMgsType extends IGetMessageType {
  filteredMessages: IMessage[]
}

export interface IGetTypingMessage {
  sender: IContact
  message: string
}
