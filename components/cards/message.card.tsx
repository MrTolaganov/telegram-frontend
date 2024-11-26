import { useCurrentContact } from '@/hooks/use-current-contact'
import { cn } from '@/lib/utils'
import { IMessage } from '@/types'
import { format } from 'date-fns'
import { Check, CheckCheck, Edit2, Trash } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ui/context-menu'
import { reactions } from '@/constants'
import Image from 'next/image'

interface Props {
  message: IMessage
  onReaction: (messageId: string, reaction: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
}

export default function MessageCard({ message, onReaction, onDeleteMessage }: Props) {
  const { currentContact, setEditedMessage } = useCurrentContact()

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'm-1 font-medium text-xs flex',
            message.receiver._id === currentContact?._id ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'relative inline p-2 pl-2.5 pr-12 max-w-full',
              message.receiver._id === currentContact?._id ? 'bg-primary' : 'bg-secondary'
            )}
          >
            {message.image && (
              <Image src={message.image} alt={message.image} width={200} height={150} />
            )}
            {message.text.length > 0 && (
              <p
                className={cn(
                  'text-sm',
                  message.receiver._id === currentContact?._id
                    ? 'text-white'
                    : 'text-black dark:text-foreground'
                )}
              >
                {message.text}
              </p>
            )}
            <div
              className={cn('text-[9px] right-1 bottom-0 absolute flex gap-[3px] text-gray-300')}
            >
              <p>{format(message.updatedAt, 'HH:mm')}</p>
              <div className='self-end'>
                {message.receiver._id === currentContact?._id &&
                  (message.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />)}
              </div>
            </div>
            <span className='absolute -right-2 -bottom-2'>{message.reaction}</span>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className='p-0 mb-10'>
        <ContextMenuItem className='grid grid-cols-10'>
          {reactions.map(reaction => (
            <div
              key={reaction}
              className={cn(
                'text-lg cursor-pointer hover:bg-primary/50 p-1 transition-all',
                message.reaction === reaction && 'bg-primary/50'
              )}
              onClick={() => onReaction(message._id, reaction)}
            >
              {reaction}
            </div>
          ))}
        </ContextMenuItem>
        {message.receiver._id === currentContact?._id && (
          <>
            <ContextMenuSeparator />
            {!message.image && (
              <ContextMenuItem className='cursor-pointer' onClick={() => setEditedMessage(message)}>
                <Edit2 size={14} />
                <span className='ml-2'>Edit</span>
              </ContextMenuItem>
            )}
            <ContextMenuItem
              className='cursor-pointer'
              onClick={() => onDeleteMessage(message._id)}
            >
              <Trash size={14} />
              <span className='ml-2'>Delete</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
