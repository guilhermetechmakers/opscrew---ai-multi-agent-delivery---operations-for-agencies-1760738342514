import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ArrowLeft, Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useAuthContext } from '@/contexts/AuthContext';
import { useFormValidation } from '@/hooks/useAuth';

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { requestPasswordReset, isResettingPassword } = useAuthContext();
  const { validateEmail } = useFormValidation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const emailValue = watch('email');

  // Real-time email validation
  React.useEffect(() => {
    if (emailValue && emailValue.length > 0) {
      if (!validateEmail(emailValue)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
        clearErrors('email');
      }
    } else {
      setEmailError('');
    }
  }, [emailValue, validateEmail, clearErrors]);

  const onSubmit = (data: ForgotPasswordFormData) => {
    requestPasswordReset(data.email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
        
        <div className="w-full max-w-md space-y-6 relative z-10">
          <div className="text-center animate-fade-in">
            <div className="flex items-center justify-center space-x-2 mb-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Bot className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                OpsCrew
              </h1>
            </div>
          </div>

          <Card className="card-hover animate-slide-up">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription className="text-base">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary hover:text-primary/80"
                  onClick={() => setIsSubmitted(false)}
                >
                  try again
                </Button>
              </div>
              
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
          
          .animate-slide-up {
            animation: slide-up 0.8s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-primary/25 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-accent/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo with animation */}
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Bot className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              OpsCrew
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">Reset your password</p>
        </div>

        <Card className="card-hover animate-slide-up">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Forgot your password?</CardTitle>
            <CardDescription className="text-base">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className={`input-focus transition-all duration-200 ${
                      errors.email || emailError ? 'border-destructive focus:ring-destructive' : ''
                    }`}
                    {...register('email')}
                  />
                  {(errors.email || emailError) && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
                  )}
                </div>
                {(errors.email || emailError) && (
                  <p className="text-sm text-destructive animate-shake">
                    {errors.email?.message || emailError}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary h-12 text-base font-medium"
                disabled={!isValid || isResettingPassword}
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link to="/signup">
            <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 transition-colors duration-200">
              Sign up
            </Button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}