
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { sessionStore } from '@/stores/sessionStore';
import { buildApiUrl, getApiHeaders } from '@/config/api';

interface SuperAdminLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

const SuperAdminLogin: React.FC<SuperAdminLoginProps> = ({ onBack, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting super admin login for:', email);
      
      const response = await fetch(buildApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('Super admin login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        console.error('Super admin login error:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Super admin login successful:', data);

      // Store the access token
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        console.log('Access token stored');
      }

      // Store user information in session
      if (data.user) {
        sessionStore.setCurrentUser(data.user);
        console.log('Super admin session set:', data.user);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, Super Admin!`,
        });

        // Call the success callback
        onLoginSuccess();
      } else {
        throw new Error('User data not received');
      }

    } catch (error) {
      console.error('Super admin login error:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
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
            <CardTitle className="text-2xl font-bold text-red-900">Super Admin</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Administrative access only
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@digitalaap.org"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
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
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Admin Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;
