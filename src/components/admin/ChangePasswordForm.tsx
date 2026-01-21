"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import LoadingSpinner from "../LoadingSpinner";
import { updateUserPassword } from "@/actions/users";

const formSchema = z
  .object({
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const ChangePasswordForm = () => {
  const { user } = useAuth();

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await updateUserPassword(user!.id, values.password);
      if (res.success) {
        form.reset();
        toast.success("Password updated successfully");
      } else {
        toast.error(res.error || "Failed to update password");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.error || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-5">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-1/3"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <Input
                    type={showPassword.password ? "text" : "password"}
                    placeholder="Enter your password"
                    {...field}
                  />
                  <span
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })}
                  >
                    {showPassword.password ? <EyeOff /> : <Eye />}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <Input
                    type={showPassword.confirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...field}
                  />
                  <span
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={() => setShowPassword({ ...showPassword, confirmPassword: !showPassword.confirmPassword })}
                  >
                    {showPassword.confirmPassword ? <EyeOff /> : <Eye />}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
};

export default ChangePasswordForm;
