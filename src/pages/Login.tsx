import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, LogIn, Shield, Users, MessageCircle, Search, Sparkles, Award, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login, signup, showSignupConfirmation, hideSignupConfirmation } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    uwNetId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.endsWith('@uw.edu')) {
      newErrors.email = 'Must use a valid @uw.edu email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      }

      if (!formData.uwNetId.trim()) {
        newErrors.uwNetId = 'UW NetID is required';
      } else if (formData.uwNetId.length < 3) {
        newErrors.uwNetId = 'UW NetID must be at least 3 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signup(formData.email, formData.password, formData.name, formData.uwNetId);
        if (!result.success) {
          setErrors({ submit: 'Failed to create account. Please try again.' });
        }
        // If successful, the confirmation will be handled by the showSignupConfirmation state
      } else {
        const success = await login(formData.email, formData.password);
        if (!success) {
          setErrors({ submit: 'Invalid email or password. Please try again.' });
        }
        // Login success will automatically navigate via AuthContext
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationComplete = () => {
    hideSignupConfirmation();
    setIsSignUp(false);
    setFormData({ email: formData.email, password: '', name: '', uwNetId: '' }); // Keep email for convenience
  };

  const features = [
    {
      icon: Search,
      title: 'Find Great Deals',
      description: 'Browse textbooks, electronics, furniture, and more from fellow Huskies',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Student Community',
      description: 'Buy and sell within the trusted UW student community',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: MessageCircle,
      title: 'Direct Messaging',
      description: 'Chat directly with buyers and sellers to arrange meetups',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Verified UW students only with safety guidelines',
      color: 'from-red-500 to-red-600',
    },
  ];

  const stats = [
    { icon: Users, label: 'Active Students', value: '2,500+' },
    { icon: Award, label: 'Items Sold', value: '10,000+' },
    { icon: Clock, label: 'Avg Response', value: '< 2 hours' },
  ];

  // Success Message Component - Show this when signup is successful
  if (showSignupConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="relative text-center max-w-lg mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">
            Account Created Successfully!
          </h2>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Welcome to HuskyMarket! Your account has been created and you're ready to start buying and selling with fellow UW students.
          </p>
          
          <div className="bg-white/80 backdrop-blur-sm border-2 border-green-200 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">What's Next?</h3>
            </div>
            <ul className="text-green-700 space-y-2 text-left">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Please sign in with your new credentials</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Start browsing items from fellow students</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>List your first item for sale</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connect with the UW community</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-green-800 font-medium">
              🎉 You're now part of the HuskyMarket community!
            </p>
          </div>
          
          <button
            onClick={handleConfirmationComplete}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Continue to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex">
        {/* Left Side - Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-12 flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-32 left-32 w-40 h-40 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-purple-600 font-bold text-xl">UW</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">HuskyMarket</h1>
                <p className="text-purple-200 text-sm">Student Marketplace</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                  <h2 className="text-3xl font-bold text-white">
                    Your Campus Marketplace
                  </h2>
                </div>
                <p className="text-purple-100 text-lg leading-relaxed">
                  Connect with fellow UW students to buy, sell, and trade items within 
                  our trusted campus community.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-purple-200 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-purple-500/30">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-purple-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 text-purple-200 text-sm">
            <p>© 2024 HuskyMarket • University of Washington</p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-xl">UW</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">HuskyMarket</h1>
                  <p className="text-gray-600 text-sm">Student Marketplace</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-700 bg-clip-text text-transparent mb-3">
                  {isSignUp ? 'Join HuskyMarket' : 'Welcome Back'}
                </h2>
                <p className="text-gray-600">
                  {isSignUp 
                    ? 'Create your account to start buying and selling'
                    : 'Sign in to your account'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠️</span>
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    UW Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="netid@uw.edu"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      UW NetID
                    </label>
                    <input
                      type="text"
                      value={formData.uwNetId}
                      onChange={(e) => handleInputChange('uwNetId', e.target.value)}
                      placeholder="Your UW NetID"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                        errors.uwNetId ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {errors.uwNetId && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <span>⚠️</span>
                        <span>{errors.uwNetId}</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600 flex items-center space-x-2">
                      <span>❌</span>
                      <span>{errors.submit}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-200 hover:scale-105"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrors({});
                    setFormData({ email: '', password: '', name: '', uwNetId: '' });
                  }}
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>

              {isSignUp && (
                <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">UW Students Only</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You must have a valid @uw.edu email address to join HuskyMarket.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;