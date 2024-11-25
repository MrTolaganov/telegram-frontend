'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { emailSchema } from '@/lib/validation'
import { UseFormReturn } from 'react-hook-form'
import { FaTelegram } from 'react-icons/fa'
import { z } from 'zod'
import { useLoading } from '@/hooks/use-loading'

interface Props {
  contactForm: UseFormReturn<z.infer<typeof emailSchema>>
  onCreateContact: (values: z.infer<typeof emailSchema>) => void
}

export default function AddContact({ contactForm, onCreateContact }: Props) {
  const { isCreating } = useLoading()

  return (
    <div className='h-screen w-full flex z-40 relative max-md:px-4'>
      <div className='flex justify-center items-center z-50 w-full'>
        <div className='flex flex-col items-center gap-4'>
          <FaTelegram size={120} className='dark:text-blue-400 text-primary' />
          <h1 className='text-3xl max-md:xl max-md:text-center font-roboto font-bold'>
            Add contacts to start chatting
          </h1>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onCreateContact)} className='space-y-2 w-full'>
              <FormField
                control={contactForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input
                        placeholder='tulaganovok04@gmail.com'
                        className='h-10 bg-secondary'
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-500' />
                  </FormItem>
                )}
              />
              <Button type='submit' className='w-full text-white' size={'lg'} disabled={isCreating}>
                Submit
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
