'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import {
  LogIn,
  Menu,
  Moon,
  Settings2,
  Sun,
  Upload,
  UserPlus,
  Volume2,
  VolumeOff,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import DangerZoneForm from '@/components/forms/danger-zone.form'
import EmailForm from '@/components/forms/email.form'
import InformationForm from '@/components/forms/information.form'
import NotificationForm from '@/components/forms/notification.form'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut, useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import { generateToken } from '@/lib/generate-token'
import { $axios } from '@/http/axios'
import { toast } from '@/hooks/use-toast'
import { PopoverClose } from '@radix-ui/react-popover'
import { UploadButton } from '@/lib/uploadthing'
import { ISettingsPayload } from '@/types'
import { useCurrentContact } from '@/hooks/use-current-contact'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { setCurrentContact } = useCurrentContact()
  const { resolvedTheme, setTheme } = useTheme()
  const { data: session, update } = useSession()
  const router = useRouter()

  const { isPending, mutate } = useMutation({
    mutationKey: ['update-muted'],
    mutationFn: async (payload: ISettingsPayload) => {
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.put('/api/user/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return data
    },
    onSuccess: async () => {
      await update()
      toast({ description: 'Profile updated successfully' })
    },
  })

  return (
    <>
      <Popover>
        <PopoverTrigger asChild className='mx-2 cursor-pointer max-md:my-4'>
          <Menu />
        </PopoverTrigger>
        <PopoverContent className='p-0 w-[100vw] md:w-[calc(100vw/4)]'>
          <h2 className='pt-2 pl-2 text-muted-foreground'>
            Settings: <span className='text-foreground'>{session?.currentUser.email}</span>
          </h2>
          <Separator className='my-2' />
          <div className='flex flex-col px-4 md:px-2 mb-2'>
            <div
              className='flex justify-between items-center p-2 hover:bg-secondary cursor-pointer'
              onClick={() => setIsProfileOpen(true)}
            >
              <div className='flex items-center gap-1'>
                <Settings2 size={16} />
                <span className='text-sm'>Profile</span>
              </div>
            </div>
            <PopoverClose
              className='flex justify-between items-center p-2 hover:bg-secondary cursor-pointer outline-0 border-0'
              onClick={() => {
                setCurrentContact(null)
                router.push('/')
              }}
            >
              <div className='flex items-center gap-1'>
                <UserPlus size={16} />
                <span className='text-sm'>Create contact</span>
              </div>
            </PopoverClose>
            <div className='flex justify-between items-center p-2 hover:bg-secondary'>
              <div className='flex items-center gap-1'>
                {!session?.currentUser.muted ? <Volume2 size={16} /> : <VolumeOff size={16} />}
                <span className='text-sm'>{!session?.currentUser.muted ? 'Unmute' : 'Mute'}</span>
              </div>
              <Switch
                checked={!session?.currentUser.muted}
                disabled={isPending}
                onCheckedChange={() => mutate({ muted: !session?.currentUser.muted })}
              />
            </div>
            <div className='flex justify-between items-center p-2 hover:bg-secondary'>
              <div className='flex items-center gap-1'>
                {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className='text-sm'>
                  {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
                </span>
              </div>
              <Switch
                checked={resolvedTheme === 'dark'}
                onCheckedChange={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              />
            </div>
            <div
              className='flex justify-between items-center border-destructive border-2 p-2 cursor-pointer'
              onClick={() => signOut()}
            >
              <div className='flex items-center gap-1 text-red-500'>
                <LogIn size={16} />
                <span className='text-sm'>Logout</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent side={'left'} className='w-full p-2'>
          <SheetHeader>
            <SheetTitle className='text-2xl'>My profile</SheetTitle>
            <SheetDescription>
              Setting up your profile will help you connect with your friends and family easily.
            </SheetDescription>
          </SheetHeader>
          <Separator className='my-2' />
          <div className='mx-auto size-36 relative'>
            <Avatar className='size-36'>
              <AvatarImage
                src={session?.currentUser.avatar}
                alt={session?.currentUser.email}
                className='object-cover'
              />
              <AvatarFallback className='text-6xl uppercase font-roboto'>
                {session?.currentUser.email.at(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <UploadButton
              endpoint={'imageUploader'}
              onClientUploadComplete={res => mutate({ avatar: res[0].url })}
              config={{ appendOnPaste: true, mode: 'auto' }}
              className='absolute right-0 bottom-0'
              appearance={{
                allowedContent: { display: 'none' },
                button: { width: 40, height: 40, borderRadius: '100%' },
              }}
              content={{ button: <Upload size={16} /> }}
            />
          </div>
          <Accordion type='single' collapsible className='mt-4'>
            <AccordionItem value='item-1'>
              <AccordionTrigger className='bg-secondary px-2'>Basic information</AccordionTrigger>
              <AccordionContent className='px-2 mt-2'>
                <InformationForm />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2' className='mt-2'>
              <AccordionTrigger className='bg-secondary px-2'>Email</AccordionTrigger>
              <AccordionContent className='px-2 mt-2'>
                <EmailForm />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3' className='mt-2'>
              <AccordionTrigger className='bg-secondary px-2'>Notification</AccordionTrigger>
              <AccordionContent className='mt-2'>
                <NotificationForm />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-4' className='mt-2'>
              <AccordionTrigger className='bg-secondary px-2'>Danger zone</AccordionTrigger>
              <AccordionContent className='my-2 px-2'>
                <DangerZoneForm />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SheetContent>
      </Sheet>
    </>
  )
}
