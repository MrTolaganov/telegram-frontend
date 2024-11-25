import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentContact } from '@/hooks/use-current-contact'
import { useLoading } from '@/hooks/use-loading'
import { sliceText } from '@/lib/utils'
import { IMessage } from '@/types'
import { Settings2 } from 'lucide-react'
import Image from 'next/image'

interface Props {
  messages: IMessage[]
}

export default function TopChat({ messages }: Props) {
  const { currentContact } = useCurrentContact()
  const { onlineContacts } = useAuth()
  const { typing } = useLoading()

  return (
    <div className='w-full flex items-center justify-between sticky top-0 z-50 h-[8vh] p-2 border-b bg-background'>
      <div className='flex items-center gap-x-4 pl-2'>
        <Avatar className='z-40'>
          <AvatarImage
            src={currentContact?.avatar}
            alt={currentContact?.email}
            className='object-cover'
          />
          <AvatarFallback className='uppercase'>{currentContact?.email[0]}</AvatarFallback>
        </Avatar>
        <div className='ml-2'>
          <h2 className='font-medium text-sm'>{currentContact?.email}</h2>
          {typing.sender?._id === currentContact?._id
            ? typing.message.length > 0 && (
                <div className='text-xs flex items-center gap-1 text-primary'>
                  <p className='animate-pulse line-clamp-1'>{sliceText(typing.message, 20)}</p>
                  <div className='self-end mb-1'>
                    <div className='flex justify-center items-center gap-1'>
                      <div className='w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                      <div className='w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.10s]'></div>
                      <div className='w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                    </div>
                  </div>
                </div>
              )
            : typing.message && (
                <p className='text-xs'>
                  {onlineContacts.some(
                    onlineContact => onlineContact._id === currentContact?._id
                  ) ? (
                    <>
                      <span className='text-primary'>online</span>
                    </>
                  ) : (
                    <>
                      <span className='text-muted-foreground'>last seen recently</span>
                    </>
                  )}
                </p>
              )}
          {!typing.message && (
            <p className='text-xs'>
              {onlineContacts.some(onlineContact => onlineContact._id === currentContact?._id) ? (
                <>
                  <span className='text-primary'>online</span>
                </>
              ) : (
                <>
                  <span className='text-muted-foreground'>last seen recently</span>
                </>
              )}
            </p>
          )}
        </div>
      </div>
      <Sheet>
        <SheetTrigger asChild className='me-2 cursor-pointer'>
          {/* <Button size={'icon'} > */}
          <Settings2 />
          {/* </Button> */}
        </SheetTrigger>
        <SheetContent className='w-full p-4 overflow-y-scroll sidebar-custom-scrollbar'>
          <SheetHeader>
            <SheetTitle />
          </SheetHeader>
          <div className='mx-auto w-36 h-36 relative'>
            <Avatar className='size-36'>
              <AvatarImage
                src={currentContact?.avatar}
                alt={currentContact?.email}
                className='object-cover'
              />
              <AvatarFallback className='text-6xl uppercase font-roboto'>
                {currentContact?.email[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <Separator className='my-2' />
          <h1 className='text-center font-roboto text-xl'>{currentContact?.email}</h1>
          <div className='flex flex-col space-y-1'>
            {currentContact?.firstName && (
              <div className='flex items-center gap-1 mt-4'>
                <p className='font-roboto'>First Name: </p>
                <p className='font-roboto text-muted-foreground'>{currentContact?.firstName}</p>
              </div>
            )}
            {currentContact?.lastName && (
              <div className='flex items-center gap-1 mt-4'>
                <p className='font-roboto'>Last Name: </p>
                <p className='font-roboto text-muted-foreground'>{currentContact?.lastName}</p>
              </div>
            )}
            {currentContact?.bio && (
              <div className='flex items-center gap-1 mt-4'>
                <p className='font-roboto'>
                  About:{' '}
                  <span className='font-roboto text-muted-foreground'>{currentContact?.bio}</span>
                </p>
              </div>
            )}
            <Separator className='my-2' />
            <h2 className='text-xl'>Image</h2>
            <div className='flex flex-col space-y-2'>
              {messages
                .filter(message => message.image)
                .map(message => (
                  <div className='w-full h-56 relative' key={message._id}>
                    <Image
                      src={message.image}
                      alt={message.image}
                      fill
                      className='object-cover rounded-md'
                    />
                  </div>
                ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
