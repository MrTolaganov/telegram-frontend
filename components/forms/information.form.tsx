import { profileSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { generateToken } from "@/lib/generate-token";
import { useSession } from "next-auth/react";
import { $axios } from "@/http/axios";

export default function InformationForm() {
  const { data: session, update } = useSession();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: session?.currentUser.firstName || "",
      lastName: session?.currentUser.lastName || "",
      bio: session?.currentUser.bio || "",
    },
  });

  const { isPending, mutate } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const token = await generateToken(session?.currentUser._id);
      const { data } = await $axios.put("/api/user/profile", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    onSuccess: () => {
      toast({ description: "Profile updated successfully" });
      update();
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <Label>First name</Label>
              <FormControl>
                <Input
                  placeholder="Otabek"
                  className="bg-secondary"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <Label>Last name</Label>
              <FormControl>
                <Input
                  placeholder="Tulaganov"
                  className="bg-secondary"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Web developer"
                  className="bg-secondary"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
