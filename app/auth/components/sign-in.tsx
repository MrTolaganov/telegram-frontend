import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { $axios } from "@/http/axios";
import { emailSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function SignIn() {
  const { setStep, setEmail } = useAuth();

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (email: string) => {
      const { data } = await $axios.post<{ email: string }>("/api/auth/login", {
        email,
      });
      return data;
    },
    onSuccess: (data) => {
      setEmail(data.email);
      setStep("verify");
      toast({ description: "We sent verification code to your email address" });
    },
  });

  const onSubmit = (values: z.infer<typeof emailSchema>) => {
    mutate(values.email);
  };

  return (
    <div className="w-full">
      <p className="text-center text-muted-foreground text-sm">
        Telegram is a messaging app with a focus on speed and security, it’s
        super-fast, simple and free.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label>Email address</Label>
                <FormControl>
                  <Input
                    placeholder="tulaganovok04@gmail.com"
                    className="h-10 bg-secondary"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            size={"lg"}
            disabled={isPending}
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
