import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ArrowLeft, CheckCircle, XCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import { useAuthContext } from '@/contexts/AuthContext';

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification, isVerifyingEmail, isResendingVerification } = useAuthContext();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      handleVerifyEmail(token);
    }
  }, [token]);

  const handleVerifyEmail = async (verificationToken: string) => {
    setVerificationStatus('loading');
    try {
      await verifyEmail(verificationToken);
      setVerificationStatus('success');
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to resend verification email');
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <Card className="card-hover animate-slide-up">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verifying your email</CardTitle>
              <CardDescription className="text-base">
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        );

      case 'success':
        return (
          <Card className="card-hover animate-slide-up">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Email verified successfully!</CardTitle>
              <CardDescription className="text-base">
                Your email address has been verified. You can now access all features of your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/dashboard">
                <Button className="w-full btn-primary h-12 text-base font-medium">
                  Continue to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card className="card-hover animate-slide-up">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">Verification failed</CardTitle>
              <CardDescription className="text-base">
                {errorMessage || 'The verification link is invalid or has expired. Please request a new verification email.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                className="w-full h-12 text-base font-medium"
              >
                {isResendingVerification ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="card-hover animate-slide-up">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verify your email</CardTitle>
              <CardDescription className="text-base">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
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
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                >
                  {isResendingVerification ? 'Sending...' : 'resend verification email'}
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
        );
    }
  };

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
        </div>

        {renderContent()}
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