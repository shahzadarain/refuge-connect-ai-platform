
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { sessionStore } from '@/stores/sessionStore';
import { buildApiUrl, getApiHeaders } from '@/config/api';

interface UnifiedLoginProps {
  onBack: () => void;
  onLoginSuccess: (userType: string) => void;
  onUNHCRValidationRequest: (email: string) => void;
}

const UnifiedLogin: React.FC<UnifiedLoginProps> = ({ 
  onBack, 
  onLoginSuccess,
  onUNHCRValidationRequest 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login for:', email);
      
      // Determine the appropriate login endpoint based on email
      let loginEndpoint = '/api/login'; // Default endpoint
      
      // Check if it's a super admin login
      if (email.includes('@admin') || email === 'admin@digitalaap.org') {
        loginEndpoint = '/api/admin/login';
      }
      
      console.log('Using login endpoint:', loginEndpoint);
      
      const response = await fetch(buildApiUrl(loginEndpoint), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        console.error('Login error:', errorData);
        
        // Handle specific error cases
        if (response.status === 403 && errorData.message?.includes('UNHCR validation')) {
          toast({
            title: "UNHCR Validation Required",
            description: errorData.message,
            variant: "default",
          });
          onUNHCRValidationRequest(email);
          return;
        }
        
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);

      // Store the access token
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        console.log('Access token stored');
      }

      // Store user information in session
      if (data.user) {
        sessionStore.setCurrentUser(data.user);
        console.log('User session set:', data.user);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.email}!`,
        });

        // Call the success callback with user type
        onLoginSuccess(data.user.user_type);
      } else {
        throw new Error('User data not received');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => {
                // Handle forgot password
                toast({
                  title: "Forgot Password",
                  description: "Please contact support for password reset assistance.",
                });
              }}
            >
              Forgot your password?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLogin;
