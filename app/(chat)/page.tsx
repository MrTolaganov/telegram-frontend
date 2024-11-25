'use client'

import ContactList from './components/contact-list'
import { useCurrentContact } from '@/hooks/use-current-contact'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { emailSchema, messageSchema } from '@/lib/validation'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import AddContact from './components/add-contact'
import TopChat from './components/top-chat'
import ContactChat from './components/conatct-chat'
import { cn } from '@/lib/utils'
import {
  IContact,
  IError,
  IExtendedGetMgsType,
  IGetMessageType,
  IGetTypingMessage,
  IMessage,
} from '@/types'
import { toast } from '@/hooks/use-toast'
import { useLoading } from '@/hooks/use-loading'
import { generateToken } from '@/lib/generate-token'
import { useSession } from 'next-auth/react'
import { $axios } from '@/http/axios'
import { Loader2 } from 'lucide-react'
import { io } from 'socket.io-client'
import { useAuth } from '@/hooks/use-auth'
import { useAudio } from '@/hooks/use-audio'

export default function Page() {
  const [contacts, setContacts] = useState<IContact[]>([])
  const [messages, setMessages] = useState<IMessage[]>([])
  const { data: session } = useSession()
  const { isLoading, setIsCreating, setIsLoading, setIsLoadingMsgs, setTyping } = useLoading()
  const { currentContact, editedMessage, setEditedMessage } = useCurrentContact()
  const socketRef = useRef<ReturnType<typeof io> | null>(null)
  const { setOnlineContacts } = useAuth()
  const { playSound } = useAudio()

  const contactForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const messageForm = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { text: '', image: '' },
  })

  const getContacts = async () => {
    try {
      setIsLoading(true)
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.get<{ contacts: IContact[] }>('/api/user/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setContacts(data.contacts)
    } catch {
      toast({ description: 'Error getting contacts', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const getMessages = async () => {
    try {
      setIsLoadingMsgs(true)
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.get<{ messages: IMessage[] }>(
        `/api/user/messages/${currentContact?._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(data.messages)
      setContacts(prev =>
        prev.map(item =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage: item.lastMessage ? { ...item.lastMessage, status: 'read' } : null,
              }
            : item
        )
      )
    } catch {
      toast({ description: 'Cannot get messages', variant: 'destructive' })
    } finally {
      setIsLoadingMsgs(false)
    }
  }

  const onCreateContact = async (values: z.infer<typeof emailSchema>) => {
    try {
      setIsCreating(true)
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.post<{ contact: IContact }>('/api/user/contact', values, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setContacts(prev => [...prev, data.contact])
      socketRef.current?.emit('createContact', {
        currentUser: session?.currentUser,
        receiver: data.contact,
      })
      toast({ description: 'Contact added successfully.' })
      contactForm.reset()
    } catch (error: any) {
      if ((error as IError).response.data.message)
        return toast({
          description: (error as IError).response.data.message,
          variant: 'destructive',
        })
      return toast({
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const onSendMessage = async (values: z.infer<typeof messageSchema>) => {
    try {
      setIsCreating(true)
      const token = await generateToken(session?.currentUser._id)

      const { data } = await $axios.post<IGetMessageType>(
        '/api/user/message',
        { ...values, receiver: currentContact?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const { message, receiver, sender } = data
      setMessages(prev => [...prev, message])

      setContacts(prev =>
        prev.map(item =>
          item._id === currentContact?._id
            ? { ...item, lastMessage: { ...message, status: 'read' } }
            : item
        )
      )

      messageForm.reset()
      socketRef.current?.emit('sendMessage', { message, receiver, sender })
      if (!data.sender.muted) {
        playSound(data.sender.sendingSound)
      }
    } catch {
      toast({ description: 'Cannot send message', variant: 'destructive' })
    } finally {
      setIsCreating(false)
    }
  }

  const onEditMessage = async (messageId: string, text: string) => {
    try {
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.put<{ message: IMessage }>(
        `/api/user/message/${messageId}`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setMessages(prev =>
        prev.map(item =>
          item._id === data.message._id ? { ...item, text: data.message.text } : item
        )
      )
      setContacts(prev =>
        prev.map(item =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage: item.lastMessage?._id === messageId ? data.message : item.lastMessage,
              }
            : item
        )
      )
      socketRef.current?.emit('updateMessage', {
        message: data.message,
        receiver: currentContact,
        sender: session?.currentUser,
      })

      setEditedMessage(null)
      messageForm.reset()
    } catch {
      toast({ description: 'Cannot edit message', variant: 'destructive' })
    }
  }

  const onSubmitMessage = async (values: z.infer<typeof messageSchema>) => {
    setIsCreating(true)
    if (editedMessage?._id) {
      onEditMessage(editedMessage._id, values.text)
    } else {
      onSendMessage(values)
    }
  }

  const onReadMessages = async () => {
    try {
      const receivedMessages = messages
        .filter(message => message.receiver._id === session?.currentUser._id)
        .filter(message => message.status !== 'read')
      if (receivedMessages.length === 0) return
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.post<{ messages: IMessage[] }>(
        '/api/user/read-messages',
        { messages: receivedMessages },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      socketRef.current?.emit('readMessages', { receiver: currentContact, messages: data.messages })
      setMessages(prev => {
        return prev.map(item => {
          const msgs = data.messages.find(msg => msg._id === item._id)
          return msgs ? { ...item, status: 'read' } : item
        })
      })
    } catch {
      toast({ description: 'Cannot read messages', variant: 'destructive' })
    }
  }

  const onReaction = async (messageId: string, reaction: string) => {
    try {
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.post<{ message: IMessage }>(
        '/api/user/reaction',
        { messageId, reaction },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(prev =>
        prev.map(item =>
          item._id === data.message._id ? { ...item, reaction: data.message.reaction } : item
        )
      )
      socketRef.current?.emit('updateMessage', {
        message: data.message,
        receiver: currentContact,
        sender: session?.currentUser,
      })
    } catch {
      toast({ description: 'Cannot send reaction to message', variant: 'destructive' })
    }
  }

  const onDeleteMessage = async (messageId: string) => {
    try {
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.delete<{ message: IMessage }>(
        `/api/user/message/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const filteredMessages = messages.filter(item => item._id !== data.message._id)
      const lastMessage = filteredMessages.length
        ? filteredMessages[filteredMessages.length - 1]
        : null
      setMessages(filteredMessages)
      setContacts(prev =>
        prev.map(item =>
          item._id === currentContact?._id
            ? {
                ...item,
                lastMessage: item.lastMessage?._id === messageId ? lastMessage : item.lastMessage,
              }
            : item
        )
      )
      socketRef.current?.emit('deleteMessage', {
        message: data.message,
        receiver: currentContact,
        sender: session?.currentUser,
        filteredMessages,
      })
    } catch {
      toast({ description: 'Cannot delete message', variant: 'destructive' })
    }
  }

  const onTyping = (e: ChangeEvent<HTMLInputElement>) => {
    socketRef.current?.emit('typing', {
      receiver: currentContact,
      sender: session?.currentUser,
      message: e.target.value,
    })
  }

  useEffect(() => {
    socketRef.current = io(process.env.WEBSOCKET_URI, { transports: ['websocket'] })
  }, [])

  useEffect(() => {
    if (session?.currentUser._id) {
      socketRef.current?.emit('addOnlineUser', session.currentUser)
      socketRef.current?.on('getOnlineUsers', (data: { socketId: string; user: IContact }[]) => {
        setOnlineContacts(data.map(({ user }) => user))
      })
      getContacts()
    }
  }, [session?.currentUser._id])

  useEffect(() => {
    if (session?.currentUser) {
      socketRef.current?.on('getCreatedUser', user => {
        setContacts(prev => {
          const isExist = prev.some(item => item._id === user._id)
          return isExist ? prev : [user, ...prev]
        })
      })

      socketRef.current?.on('getNewMessage', ({ message, sender, receiver }: IGetMessageType) => {
        setTyping({ sender: null, message: '' })

        if (message.sender._id === currentContact?._id) {
          setMessages(prev => [...prev, message])
        }

        setContacts(prev =>
          prev.map(item =>
            item._id === sender._id
              ? {
                  ...item,
                  lastMessage: {
                    ...message,
                    status: currentContact?._id === sender._id ? 'read' : message.status,
                  },
                }
              : item
          )
        )

        toast({
          title: 'New message',
          description: `${sender.email.split('@').at(0)} sent you a message`,
        })

        if (!receiver.muted) {
          playSound(receiver.notificationSound)
        }
      })

      socketRef.current?.on('getReadMessages', (messages: IMessage[]) => {
        setMessages(prev => {
          return prev.map(item => {
            const msgs = messages.find(msg => msg._id === item._id)
            return msgs ? { ...item, status: 'read' } : item
          })
        })
      })

      socketRef.current?.on('getUpdateMessage', ({ message, sender }: IGetMessageType) => {
        setTyping({ sender: null, message: '' })

        setMessages(prev =>
          prev.map(item =>
            item._id === message._id
              ? { ...item, reaction: message.reaction, text: message.text }
              : item
          )
        )
        setContacts(prev =>
          prev.map(item =>
            item._id === sender._id
              ? {
                  ...item,
                  lastMessage: item.lastMessage?._id === message._id ? message : item.lastMessage,
                }
              : item
          )
        )
      })

      socketRef.current?.on(
        'getDeletedMessage',
        ({ message, sender, filteredMessages }: IExtendedGetMgsType) => {
          const lastMessage = filteredMessages.length
            ? filteredMessages[filteredMessages.length - 1]
            : null
          setMessages(filteredMessages)
          setContacts(prev =>
            prev.map(item =>
              item._id === sender._id
                ? {
                    ...item,
                    lastMessage:
                      item.lastMessage?._id === message._id ? lastMessage : item.lastMessage,
                  }
                : item
            )
          )
        }
      )

      socketRef.current?.on('getTyping', ({ sender, message }: IGetTypingMessage) => {
        if (sender._id === currentContact?._id) {
          setTyping({ sender, message })
        }
      })
    }
  }, [session?.currentUser, socketRef, currentContact?._id])

  useEffect(() => {
    if (currentContact?._id) {
      getMessages()
    }
  }, [currentContact])

  return (
    <>
      <div className={cn('w-96 max-md:w-16 h-screen border-r fixed inset-0 z-50')}>
        {isLoading ? (
          <div className='w-full h-[95vh] flex justify-center items-center'>
            <Loader2 size={50} className='animate-spin' />
          </div>
        ) : (
          <ContactList contacts={contacts} />
        )}
      </div>
      <div className='md:pl-96 pl-16 w-full'>
        {currentContact?._id ? (
          <div className='w-full relative'>
            <TopChat messages={messages} />
            <ContactChat
              messageForm={messageForm}
              messages={messages}
              onReadMessages={onReadMessages}
              onSubmitMessage={onSubmitMessage}
              onReaction={onReaction}
              onDeleteMessage={onDeleteMessage}
              onTyping={onTyping}
            />
          </div>
        ) : (
          <AddContact contactForm={contactForm} onCreateContact={onCreateContact} />
        )}
      </div>
    </>
  )
}
