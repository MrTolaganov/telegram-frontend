'use client'

import { Input } from '@/components/ui/input'
import Settings from './settings'
import { IContact } from '@/types'
import { cn, sliceText } from '@/lib/utils'
import { useCurrentContact } from '@/hooks/use-current-contact'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export default function ContactList({ contacts }: { contacts: IContact[] }) {
  const { currentContact, setCurrentContact } = useCurrentContact()
  const [query, setQuery] = useState('')
  const { data: session } = useSession()
  const { onlineContacts } = useAuth()

  const filteredContacts = contacts
    .filter(contact => contact.email.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const dateA = a.lastMessage?.updatedAt ? new Date(a.lastMessage.updatedAt).getTime() : 0
      const dateB = b.lastMessage?.updatedAt ? new Date(b.lastMessage.updatedAt).getTime() : 0
      return dateB - dateA
    })

  const renderContact = (contact: IContact) => {
    const onChat = () => {
      if (currentContact?._id === contact._id) return
      setCurrentContact(contact)
    }

    return (
      <div
        className={cn(
          'flex justify-between items-center cursor-pointer hover:bg-primary/10 p-2',
          currentContact?._id === contact._id && 'bg-primary/10'
        )}
        onClick={onChat}
      >
        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Avatar className='z-40'>
              <AvatarImage src={contact.avatar} alt={contact.email} className='object-cover' />
              <AvatarFallback className='uppercase'>{contact.email[0]}</AvatarFallback>
            </Avatar>
            {onlineContacts.some(onlineContact => onlineContact._id === contact._id) && (
              <div className='size-3 bg-primary absolute rounded-full bottom-0 right-0 !z-40' />
            )}
          </div>
          <div className='max-md:hidden'>
            <h2 className='line-clamp-1 text-sm'>{contact.email.split('@')[0]}</h2>
            {contact.lastMessage?.image ? (
              <div className='flex items-center gap-x-1'>
                <Image src={contact.lastMessage.image} alt={'Image'} width={20} height={10} />
                <p
                  className={cn(
                    'text-xs line-clamp-1',
                    contact.lastMessage
                      ? contact.lastMessage.sender._id === session?.currentUser._id
                        ? 'text-muted-foreground'
                        : contact.lastMessage.status === 'read'
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  Photo
                </p>
              </div>
            ) : (
              <p
                className={cn(
                  'text-xs line-clamp-1',
                  contact.lastMessage
                    ? contact.lastMessage.sender._id === session?.currentUser._id
                      ? 'text-muted-foreground'
                      : contact.lastMessage.status === 'read'
                      ? 'text-muted-foreground'
                      : 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {contact.lastMessage ? sliceText(contact.lastMessage.text, 25) : 'No messages yet'}
              </p>
            )}
          </div>
        </div>
        {contact.lastMessage && (
          <div className='self-end max-md:hidden'>
            <p className='text-xs text-muted-foreground'>
              {format(contact.lastMessage.createdAt, 'MMM dd, HH:mm')}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Top bar */}
      <div className='flex items-center bg-background pl-2 sticky top-0 z-50'>
        <Settings />
        <div className='m-2 w-full max-md:hidden'>
          <Input
            className='bg-secondary'
            type='text'
            placeholder='Search...'
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </div>
      </div>
      {/* Contacts */}
      {filteredContacts.length === 0 ? (
        <div className='max-md:hidden w-full h-[95vh] flex justify-center items-center text-center text-muted-foreground'>
          <p>Contact list is empty</p>
        </div>
      ) : (
        filteredContacts.map(contact => <div key={contact._id}>{renderContact(contact)}</div>)
      )}
    </>
  )
}
