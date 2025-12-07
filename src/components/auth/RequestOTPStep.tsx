"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "../../services/authService";
import { COLORS } from "@/constants/config";

const requestSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestOTPStepProps {
  onSuccess: (email: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const RequestOTPStep: React.FC<RequestOTPStepProps> = ({
  onSuccess,
  isLoading,
  setIsLoading,
}) => {
  const { showToast } = useToast();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: RequestFormValues) => {
    setIsLoading(true);
    try {
      await authService.requestPasswordReset(values.email);
      showToast({
        title: "OTP Sent",
        type: "success",
        message: "If an account exists, an OTP has been sent to your email.",
      });
      onSuccess(values.email);
    } catch (error) {
      showToast({
        title: "Request Failed",
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel style={{ color: COLORS.gray[700] }}>
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...field}
                  style={{
                    borderColor: COLORS.gray[300],
                    color: COLORS.gray[900],
                  }}
                  className="focus:ring-2 focus:border-transparent"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full font-medium transition-all duration-200 hover:shadow-lg"
          disabled={isLoading}
          style={{
            backgroundColor: COLORS.primary[500],
            color: "white",
          }}
        >
          {isLoading ? "Sending OTP..." : "Send Reset Code"}
        </Button>
      </form>
    </Form>
  );
};

export default RequestOTPStep;
