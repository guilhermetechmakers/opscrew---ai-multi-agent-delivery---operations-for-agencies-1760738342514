import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useAuthContext } from '@/contexts/AuthContext';
import { usePasswordStrength } from '@/hooks/useAuth';

// Form validation schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmPasswordReset, isConfirmingPasswordReset } = useAuthContext();
  const { calculateStrength } = usePasswordStrength();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [], isValid: false });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [token, setToken] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  // Get token from URL params
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      navigate('/forgot-password');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, navigate]);

  // Real-time password strength calculation
  useEffect(() => {
    if (passwordValue && passwordValue.length > 0) {
      const strength = calculateStrength(passwordValue);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [], isValid: false });
    }
  }, [passwordValue, calculateStrength]);

  // Password confirmation validation
  useEffect(() => {
    if (confirmPasswordValue && passwordValue) {
      if (confirmPasswordValue !== passwordValue) {
        setError('confirmPassword', { message: 'Passwords do not match' });
      } else {
        clearErrors('confirmPassword');
      }
    }
  }, [confirmPasswordValue, passwordValue, setError, clearErrors]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;
    
    confirmPasswordReset({
      token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    setIsSubmitted(true);
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-destructive';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Good';
    return 'Strong';
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
              <CardTitle className="text-2xl">Password reset successful</CardTitle>
              <CardDescription className="text-base">
                Your password has been successfully reset. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/login">
                <Button className="w-full btn-primary h-12 text-base font-medium">
                  Continue to Sign In
                </Button>
              </Link>
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
          <p className="text-muted-foreground text-lg">Set your new password</p>
        </div>

        <Card className="card-hover animate-slide-up">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription className="text-base">
              Enter your new password below. Make sure it's strong and secure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    className={`input-focus transition-all duration-200 ${
                      errors.password ? 'border-destructive focus:ring-destructive' : ''
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {passwordValue && passwordValue.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.score <= 1 ? 'text-destructive' :
                        passwordStrength.score <= 2 ? 'text-orange-500' :
                        passwordStrength.score <= 3 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {getPasswordStrengthText(passwordStrength.score)}
                      </span>
                    </div>
                    <Progress 
                      value={(passwordStrength.score / 4) * 100} 
                      className="h-2"
                    />
                    <div className="space-y-1">
                      {passwordStrength.feedback.map((feedback, index) => (
                        <div key={index} className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <XCircle className="h-3 w-3" />
                          <span>{feedback}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-sm text-destructive animate-shake">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    className={`input-focus transition-all duration-200 ${
                      errors.confirmPassword ? 'border-destructive focus:ring-destructive' : ''
                    }`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {confirmPasswordValue && confirmPasswordValue === passwordValue && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive animate-shake">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary h-12 text-base font-medium"
                disabled={!isValid || isConfirmingPasswordReset || !passwordStrength.isValid}
              >
                {isConfirmingPasswordReset ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset Password
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