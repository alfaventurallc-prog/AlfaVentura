"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authUtils } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import LoadingSpinner from "../LoadingSpinner";
import { loginUser } from "@/actions/auth";
import { useRouter } from "nextjs-toploader/app";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const AdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    if (authUtils.isAuthenticated() && authUtils.isAdmin()) {
      router.push("/admin");
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const response = await loginUser(values.email, values.password);

      if (response.success && response.user && response.user.role === "ADMIN") {
        authUtils.setAuthCookies(response.token, response.user.role);
        localStorage.setItem("user", JSON.stringify(response.user));
        router.push("/admin");
        toast.success("Login successful");
      } else {
        toast.error(response.error || "Login failed");
      }
    } catch (error: any) {
      console.log(error.response?.data?.error || "Login failed");
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              {/* <FormControl> */}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  {...field}
                />
                <span
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </span>
              </div>
              {/* </FormControl> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default AdminLoginForm;
