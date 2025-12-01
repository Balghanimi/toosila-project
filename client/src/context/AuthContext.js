import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user from localStorage on app start and validate token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('currentUser');

        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          // Validate user data structure - support both email and phone-based users
          if (userData.id && userData.name && (userData.email || userData.phone)) {
            // Load cached user first for immediate UI rendering
            setUser(userData);

            // Validate token with backend (5-second timeout)
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);

              const response = await fetch(
                `${process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://toosila-backend-production.up.railway.app/api' : 'http://localhost:5000/api')}/auth/me`,
                {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  signal: controller.signal,
                }
              );

              clearTimeout(timeoutId);

              if (!response.ok) {
                // Token is invalid or expired
                console.warn('Token validation failed:', response.status);
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                setUser(null);
              } else {
                // Token is valid, update user data if needed
                const result = await response.json();
                if (result.data && result.data.user) {
                  const freshUserData = result.data.user;
                  localStorage.setItem('currentUser', JSON.stringify(freshUserData));
                  setUser(freshUserData);
                }
              }
            } catch (tokenError) {
              // Network error or timeout - keep cached user (offline mode)
              // Token will be validated on next API call
              console.warn('Token validation failed (network error):', tokenError.message);
            }
          } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Helper function to get all users from localStorage
  const getAllUsers = () => {
    try {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  // Register function - API-based
  const register = async (userData) => {
    setError('');
    setLoading(true);

    try {
      const { name, email, password, userType = 'passenger' } = userData;

      // Validation
      if (!name || !email || !password) {
        throw new Error('الاسم والبريد الإلكتروني وكلمة المرور مطلوبة');
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('البريد الإلكتروني غير صحيح');
      }

      if (password.length < 5) {
        throw new Error('كلمة المرور يجب أن تكون 5 أحرف أو أرقام على الأقل');
      }

      // Call API
      const data = await authAPI.register({
        name,
        email,
        password,
        userType,
      });

      // Save token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      setUser(data.data.user);

      setLoading(false);
      return { success: true, user: data.data.user };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  // Phone-based login function
  const loginWithPhone = async (phone) => {
    setError('');
    setLoading(true);

    try {
      if (!phone) {
        throw new Error('رقم الهاتف مطلوب');
      }

      const allUsers = getAllUsers();

      // Find user by phone
      const foundUser = allUsers.find((u) => u.phone === phone.trim());

      if (!foundUser) {
        throw new Error('رقم الهاتف غير مسجل. يرجى إنشاء حساب جديد.');
      }

      // Set current user
      const userForStorage = { ...foundUser };
      localStorage.setItem('currentUser', JSON.stringify(userForStorage));
      setUser(userForStorage);

      setLoading(false);
      return { success: true, user: userForStorage };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  // Login function - supports both email/password and direct token/user (for OTP flow)
  const login = async (credentialsOrToken, userDataOrNull = null) => {
    setError('');
    setLoading(true);

    try {
      // Check if this is a direct login with token and user (from OTP verification)
      if (typeof credentialsOrToken === 'string' && userDataOrNull) {
        // Direct login with token and user object
        const token = credentialsOrToken;
        const userData = userDataOrNull;

        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);

        setLoading(false);
        return { success: true, user: userData };
      }

      // Traditional email/password login
      const { email, password } = credentialsOrToken;

      if (!email || !password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
      }

      // Call API
      const data = await authAPI.login(email, password);

      // Save token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      setUser(data.data.user);

      setLoading(false);
      return { success: true, user: data.data.user };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setUser(null);
    setError('');
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'غير مسجل دخول' };

    try {
      // Validate updates
      if (updates.email && !/^\S+@\S+\.\S+$/.test(updates.email)) {
        throw new Error('البريد الإلكتروني غير صحيح');
      }

      if (updates.phone && !/^07\d{9}$/.test(updates.phone)) {
        throw new Error('رقم الهاتف غير صحيح');
      }

      // Call API
      const data = await authAPI.updateProfile(updates);

      // Update current user
      const updatedUser = data.data.user;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Get user by ID
  const getUserById = (userId) => {
    const allUsers = getAllUsers();
    return allUsers.find((u) => u.id === userId);
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user is driver
  const isDriver = user?.isDriver === true;

  // Check if user is passenger
  const isPassenger = user?.isDriver === false;

  const value = {
    user,
    currentUser: user,
    setCurrentUser: setUser,
    loading,
    error,
    register,
    login,
    loginWithPhone,
    logout,
    updateProfile,
    getUserById,
    isAuthenticated,
    isDriver,
    isPassenger,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
