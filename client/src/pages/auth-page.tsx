import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Video, UserPlus, LogIn } from "lucide-react";

const loginSchema = insertUserSchema.extend({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50" data-testid="auth-page">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Column - Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-telegram to-telegram-dark rounded-full flex items-center justify-center mx-auto mb-4">
                  {isLogin ? (
                    <LogIn className="text-white text-2xl" data-testid="icon-login" />
                  ) : (
                    <UserPlus className="text-white text-2xl" data-testid="icon-register" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-title">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-gray-600" data-testid="text-subtitle">
                  {isLogin ? "Sign in to access your videos" : "Join us to access amazing videos"}
                </p>
              </div>

              {isLogin ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" data-testid="form-login">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-email">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-password">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                data-testid="input-password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-telegram to-telegram-dark hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      disabled={loginMutation.isPending}
                      data-testid="button-submit-login"
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4" data-testid="form-register">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-email-register">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              data-testid="input-email-register"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-password-register">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                data-testid="input-password-register"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password-register"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-confirm-password">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                data-testid="input-confirm-password"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                data-testid="button-toggle-confirm-password"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-telegram to-telegram-dark hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      disabled={registerMutation.isPending}
                      data-testid="button-submit-register"
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-telegram hover:underline font-medium"
                    data-testid="button-switch-mode"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Hero Section */}
        <div className="hidden lg:block text-center">
          <div className="max-w-md mx-auto">
            <div className="w-32 h-32 bg-gradient-to-r from-telegram to-telegram-dark rounded-full flex items-center justify-center mx-auto mb-8">
              <Video className="text-white text-5xl" data-testid="icon-hero" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4" data-testid="text-hero-title">
              Your Video Hub
            </h2>
            <p className="text-lg text-gray-600 mb-6" data-testid="text-hero-description">
              Discover, play, and share amazing videos in our comprehensive video management platform.
            </p>
            <div className="space-y-3 text-left">
              <div className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-telegram rounded-full mr-3"></div>
                <span>High-quality video streaming</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-telegram rounded-full mr-3"></div>
                <span>Easy sharing with friends</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-telegram rounded-full mr-3"></div>
                <span>Download for offline viewing</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-telegram rounded-full mr-3"></div>
                <span>Telegram integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
