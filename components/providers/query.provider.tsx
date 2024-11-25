"use client";

import { ChildProps, IError } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const onError = (error: Error | IError) => {
  if ((error as IError).response.data.message)
    return toast({
      description: (error as IError).response.data.message,
      variant: "destructive",
    });
  return toast({ description: "Something went wrong", variant: "destructive" });
};

const queryClient = new QueryClient({
  defaultOptions: { mutations: { onError } },
});

export default function QueryProvider({ children }: ChildProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
