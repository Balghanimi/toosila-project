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

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('currentUser');
        
        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          // Validate user data structure
          if (userData.id && userData.email && userData.name) {
            setUser(userData);
            // Verify token with server
            try {
              const profileData = await authAPI.getProfile();
              if (profileData.success) {
                setUser(profileData.data.user);
                localStorage.setItem('currentUser', JSON.stringify(profileData.data.user));
              }
            } catch (error) {
              console.error('Token verification failed:', error);
              localStorage.removeItem('currentUser');
              localStorage.removeItem('token');
              setUser(null);
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

  // Helper function to save users to localStorage
  const saveAllUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  // Helper function to generate user ID
  const generateUserId = () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
        userType
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
      const foundUser = allUsers.find(u => u.phone === phone.trim());

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

  // Login function - API-based
  const login = async (credentials) => {
    setError('');
    setLoading(true);

    try {
      const { email, password } = credentials;

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
    return allUsers.find(u => u.id === userId);
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
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
