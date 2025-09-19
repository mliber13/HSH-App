import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const AuthWrapper = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('userData');
    if (userData) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Simple login validation
        if (!formData.email || !formData.password) {
          throw new Error('Please enter both email and password');
        }
        
        // For demo purposes, accept any email/password combination
        const userData = {
          id: 'demo-user',
          email: formData.email,
          firstName: formData.firstName || 'Demo',
          lastName: formData.lastName || 'User'
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        setIsAuthenticated(true);
        toast({
          title: "Welcome back! 👋",
          description: "You've been logged in successfully."
        });
      } else {
        // Registration validation
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
          throw new Error('Please fill in all required fields');
        }
        
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        const userData = {
          id: 'demo-user',
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        setIsAuthenticated(true);
        toast({
          title: "Account created! 🎉",
          description: "Your account has been created and you're now logged in."
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setFormData({ email: '', password: '', firstName: '', lastName: '' });
    toast({
      title: "Logged out",
      description: "You've been logged out successfully."
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto text-brandPrimary animate-pulse mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl font-bold">HSH Contractor</CardTitle>
                  <p className="text-white/80 text-sm">Management System</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      isLogin 
                        ? 'bg-white text-brandPrimary shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <LogIn className="h-4 w-4 inline mr-2" />
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      !isLogin 
                        ? 'bg-white text-brandPrimary shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <UserPlus className="h-4 w-4 inline mr-2" />
                    Register
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required={!isLogin}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required={!isLogin}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold py-3"
                >
                  {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return React.cloneElement(children, { onLogout: handleLogout });
};

export default AuthWrapper;