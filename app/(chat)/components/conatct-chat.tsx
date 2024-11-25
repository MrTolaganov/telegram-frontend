import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Paperclip, Send, Smile } from 'lucide-react'
import emojies from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { z } from 'zod'
import { messageSchema } from '@/lib/validation'
import { UseFormReturn } from 'react-hook-form'
import { useTheme } from 'next-themes'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useLoading } from '@/hooks/use-loading'
import ChatLoader from '@/components/loaders/chat.loader'
import { IMessage } from '@/types'
import MessageCard from '@/components/cards/message.card'
import { useCurrentContact } from '@/hooks/use-current-contact'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UploadDropzone } from '@/lib/uploadthing'
import { useSession } from 'next-auth/react'

interface Props {
  messages: IMessage[]
  messageForm: UseFormReturn<z.infer<typeof messageSchema>>
  onSubmitMessage: (values: z.infer<typeof messageSchema>) => Promise<void>
  onReadMessages: () => Promise<void>
  onReaction: (messageId: string, reaction: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
  onTyping: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function ContactChat({
  messages,
  messageForm,
  onSubmitMessage,
  onReadMessages,
  onReaction,
  onDeleteMessage,
  onTyping,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollRef = useRef<HTMLFormElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const { resolvedTheme } = useTheme()
  const { isLoadingMsgs } = useLoading()
  const { currentContact, editedMessage, setEditedMessage } = useCurrentContact()

  const filteredMessages = messages.filter(
    (message, index, self) =>
      ((message.sender._id === session?.currentUser?._id &&
        message.receiver._id === currentContact?._id) ||
        (message.sender._id === currentContact?._id &&
          message.receiver._id === session?.currentUser?._id)) &&
      index === self.findIndex(m => m._id === message._id)
  )

  const handleEmojiSelect = (emoji: string) => {
    const input = inputRef.current
    if (!input) return

    const text = messageForm.getValues('text')
    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    const newText = text.slice(0, start) + emoji + text.slice(end)
    messageForm.setValue('text', newText)

    setTimeout(() => {
      input.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    onReadMessages()
  }, [messages.length])

  useEffect(() => {
    if (editedMessage?._id) {
      messageForm.setValue('text', editedMessage.text)
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [editedMessage?._id])

  return (
    <div className='flex flex-col justify-end z-40 min-h-[92vh]'>
      {/* Loading */}
      {isLoadingMsgs && <ChatLoader />}
      {/* Messages */}
      {filteredMessages.map((message, index) => (
        <MessageCard
          key={index}
          message={message}
          onReaction={onReaction}
          onDeleteMessage={onDeleteMessage}
        />
      ))}

      {/* Start conversation */}

      {messages.length === 0 && (
        <div className='w-full h-[88vh] flex items-center justify-center'>
          <div
            className='text-[100px] cursor-pointer'
            onClick={() => onSubmitMessage({ text: '✋' })}
          >
            ✋
          </div>
        </div>
      )}
      {/* Message input */}
      <Form {...messageForm}>
        <form
          onSubmit={messageForm.handleSubmit(onSubmitMessage)}
          className='w-full flex relative'
          ref={scrollRef}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button size='icon' type='button' variant='secondary'>
                <Smile />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='p-0 border-none rounded-md absolute bottom-0'>
              <Picker
                data={emojies}
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                onEmojiSelect={(emoji: { native: string }) => handleEmojiSelect(emoji.native)}
              />
            </PopoverContent>
          </Popover>
          <FormField
            control={messageForm.control}
            name='text'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    className='bg-secondary border-l border-l-muted-foreground border-r border-r-muted-foreground h-9'
                    placeholder='Type a message'
                    value={field.value}
                    onBlur={() => field.onBlur()}
                    onChange={e => {
                      field.onChange(e.target.value)
                      onTyping(e)
                      if (e.target.value === '') setEditedMessage(null)
                    }}
                    ref={inputRef}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size={'icon'} type='button' variant={'secondary'}>
                <Paperclip />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle />
              </DialogHeader>
              <UploadDropzone
                endpoint={'imageUploader'}
                onClientUploadComplete={res => {
                  onSubmitMessage({ text: '', image: res[0].url })
                  setIsOpen(false)
                }}
                config={{ appendOnPaste: true, mode: 'auto' }}
              />
            </DialogContent>
          </Dialog>
          <Button type='submit' size={'icon'}>
            <Send />
          </Button>
        </form>
      </Form>
    </div>
  )
}
