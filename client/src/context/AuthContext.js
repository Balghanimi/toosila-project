import React, { createContext, useContext, useState, useEffect } from 'react';

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
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('currentUser');
      
      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        // Validate user data structure
        if (userData.id && userData.email && userData.name) {
          setUser(userData);
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

      if (password.length < 6) {
        throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      }

      // Call API
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          isDriver: userType === 'driver',
          languagePreference: 'ar'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'فشل في إنشاء الحساب');
      }

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
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'فشل في تسجيل الدخول');
      }

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
      const allUsers = getAllUsers();
      const userIndex = allUsers.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        throw new Error('المستخدم غير موجود');
      }

      // Validate updates
      if (updates.email && !/^\S+@\S+\.\S+$/.test(updates.email)) {
        throw new Error('البريد الإلكتروني غير صحيح');
      }

      if (updates.phone && !/^07\d{9}$/.test(updates.phone)) {
        throw new Error('رقم الهاتف غير صحيح');
      }

      // Check for duplicate email/phone
      if (updates.email || updates.phone) {
        const duplicate = allUsers.find(u => 
          u.id !== user.id && 
          (u.email === updates.email || u.phone === updates.phone)
        );
        if (duplicate) {
          throw new Error('البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل');
        }
      }

      // Update user
      const updatedUser = {
        ...allUsers[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      allUsers[userIndex] = updatedUser;
      saveAllUsers(allUsers);

      // Update current user
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
