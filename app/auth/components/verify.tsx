import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { $axios } from '@/http/axios'
import { otpSchema } from '@/lib/validation'
import { IContact } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { signIn } from 'next-auth/react'

export default function Verify() {
  const { email } = useAuth()

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email, otp: '' },
  })

  const { isPending, mutate } = useMutation({
    mutationKey: ['verify'],
    mutationFn: async (otp: string) => {
      const { data } = await $axios.post<{ user: IContact }>('/api/auth/verify', {
        email,
        otp: +otp,
      })
      return data
    },
    onSuccess: ({ user }) => {
      signIn('credentials', { email: user.email, callbackUrl: '/' })
      toast({ description: 'Authorization verified successfully' })
    },
  })

  const onSubmit = (values: z.infer<typeof otpSchema>) => {
    mutate(values.otp)
  }

  return (
    <div className='w-full'>
      <p className='text-center text-muted-foreground text-sm'>
        We have sent you an email with a verification code to your email address. Please enter the
        code below.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-4 mt-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <Label>Email address</Label>
                <FormControl>
                  <Input disabled className='h-10 bg-secondary' {...field} />
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='otp'
            render={({ field }) => (
              <FormItem>
                <Label>One-Time Password</Label>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    {...field}
                    disabled={isPending}
                  >
                    <InputOTPGroup className='w-full space-x-4'>
                      <InputOTPSlot index={0} className='w-full bg-secondary' />
                      <InputOTPSlot index={1} className='w-full bg-secondary' />
                      <InputOTPSlot index={2} className='w-full bg-secondary' />
                      <InputOTPSlot index={3} className='w-full bg-secondary' />
                      <InputOTPSlot index={4} className='w-full bg-secondary' />
                      <InputOTPSlot index={5} className='w-full bg-secondary' />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className='text-xs text-red-500' />
              </FormItem>
            )}
          />
          <Button type='submit' className='w-full text-white' size={'lg'} disabled={isPending}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  )
}
