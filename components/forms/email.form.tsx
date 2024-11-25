import { oldEmailSchema, otpSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { useMutation } from "@tanstack/react-query";
import { generateToken } from "@/lib/generate-token";
import { signOut, useSession } from "next-auth/react";
import { $axios } from "@/http/axios";
import { toast } from "@/hooks/use-toast";

export default function EmailForm() {
  const [verify, setVerify] = useState(false);
  const { data: session } = useSession();

  const emailForm = useForm<z.infer<typeof oldEmailSchema>>({
    resolver: zodResolver(oldEmailSchema),
    defaultValues: { email: "", oldEmail: session?.currentUser.email },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "", email: "" },
  });

  const otpMutation = useMutation({
    mutationKey: ["sendOtp"],
    mutationFn: async (email: string) => {
      const token = await generateToken(session?.currentUser._id);
      const { data } = await $axios.post<{ email: string }>(
        "/api/user/send-otp",
        { email },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: ({ email }) => {
      otpForm.setValue("email", email);
      setVerify(true);
      toast({
        description: "Verification code has just sent your email address",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: async (otp: string) => {
      const token = await generateToken(session?.currentUser._id);
      const { data } = await $axios.put<{ email: string }>(
        "/api/user/email",
        { email: emailForm.getValues("email"), otp: +otp },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    onSuccess: async () => {
      await signOut();
      toast({ description: "Email address updated successfully." });
    },
  });

  const onEmailSubmit = (values: z.infer<typeof oldEmailSchema>) => {
    otpMutation.mutate(values.email);
  };

  const onVerifySubmit = (values: z.infer<typeof otpSchema>) => {
    verifyMutation.mutate(values.otp);
  };

  return !verify ? (
    <Form {...emailForm}>
      <form
        onSubmit={emailForm.handleSubmit(onEmailSubmit)}
        className="space-y-2"
      >
        <FormField
          control={emailForm.control}
          name="oldEmail"
          render={({ field }) => (
            <FormItem>
              <Label>Current email</Label>
              <FormControl>
                <Input className="h-10 bg-secondary" disabled {...field} />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label>Enter a new email</Label>
              <FormControl>
                <Input
                  placeholder="tulaganovok04@gmail.com"
                  className="h-10 bg-secondary"
                  {...field}
                  disabled={otpMutation.isPending}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={otpMutation.isPending}
        >
          Verify email
        </Button>
      </form>
    </Form>
  ) : (
    <Form {...otpForm}>
      <form
        onSubmit={otpForm.handleSubmit(onVerifySubmit)}
        className="space-y-2"
      >
        <Label>New email</Label>
        <Input
          className="h-10 bg-secondary"
          disabled
          value={emailForm.watch("email")}
        />
        <FormField
          control={otpForm.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <Label>One-Time Password</Label>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  {...field}
                  disabled={verifyMutation.isPending}
                >
                  <InputOTPGroup className="w-full space-x-4">
                    <InputOTPSlot index={0} className="w-full bg-secondary" />
                    <InputOTPSlot index={1} className="w-full bg-secondary" />
                    <InputOTPSlot index={2} className="w-full bg-secondary" />
                    <InputOTPSlot index={3} className="w-full bg-secondary" />
                    <InputOTPSlot index={4} className="w-full bg-secondary" />
                    <InputOTPSlot index={5} className="w-full bg-secondary" />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={verifyMutation.isPending}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
