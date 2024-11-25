import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { confirmTextSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { useMutation } from '@tanstack/react-query'
import { generateToken } from '@/lib/generate-token'
import { signOut, useSession } from 'next-auth/react'
import { $axios } from '@/http/axios'
import { toast } from '@/hooks/use-toast'

export default function DangerZoneForm() {
  const { data: session } = useSession()

  const form = useForm<z.infer<typeof confirmTextSchema>>({
    resolver: zodResolver(confirmTextSchema),
    defaultValues: { confirmText: '' },
  })

  const { isPending, mutate } = useMutation({
    mutationKey: ['delete-profile'],
    mutationFn: async () => {
      const token = await generateToken(session?.currentUser._id)
      const { data } = await $axios.delete('/api/user/delete', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return data
    },
    onSuccess: async () => {
      toast({ description: 'Your account deleted successfully.' })
      await signOut()
    },
  })

  const onSubmit = (values: z.infer<typeof confirmTextSchema>) => {
    console.log(values)
    mutate()
  }

  return (
    <>
      <p className='text-xs text-muted-foreground text-center'>
        Are you sure you want to delete your account? This action cannot be undone.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button className='mt-2 w-full font-roboto font-bold' variant={'destructive'}>
            Delete permanently
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove
              your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
              <FormField
                control={form.control}
                name='confirmText'
                render={({ field }) => (
                  <FormItem>
                    <FormDescription>
                      Please type <span className='font-bold'>delete my account</span> to confirm.
                    </FormDescription>
                    <FormControl>
                      <Input className='bg-secondary' {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage className='text-xs text-red-500' />
                  </FormItem>
                )}
              />
              <Button
                className='w-full font-bold hover:bg-red-500 outline-red-500 border border-red-500 text-red-500 hover:text-white'
                disabled={isPending}
                variant={'outline'}
              >
                Submit
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
