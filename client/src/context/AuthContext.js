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
        console.log('========================================');
        console.log('[AUTH] 🔍 APP RELOAD - Checking stored auth data');
        console.log(
          '[AUTH] Device:',
          /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? '📱 MOBILE' : '💻 DESKTOP'
        );
        console.log('[AUTH] User Agent:', navigator.userAgent);
        console.log('========================================');

        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('currentUser');
        const activeMode = localStorage.getItem('activeMode');

        // Also check sessionStorage (should be empty)
        const sessionToken = sessionStorage.getItem('token');
        const sessionUser = sessionStorage.getItem('currentUser');

        // Debug: Log what we found in localStorage
        console.log(
          '[AUTH] 📦 localStorage.token:',
          token ? `✅ EXISTS (${token.substring(0, 30)}...)` : '❌ NULL'
        );
        console.log('[AUTH] 📦 localStorage.currentUser:', savedUser ? '✅ EXISTS' : '❌ NULL');
        console.log('[AUTH] 📦 localStorage.activeMode:', activeMode || '❌ NULL');
        console.log(
          '[AUTH] 📦 sessionStorage.token:',
          sessionToken ? '⚠️ FOUND (SHOULD BE EMPTY!)' : '✅ Empty (correct)'
        );
        console.log(
          '[AUTH] 📦 sessionStorage.currentUser:',
          sessionUser ? '⚠️ FOUND (SHOULD BE EMPTY!)' : '✅ Empty (correct)'
        );

        if (token && savedUser) {
          console.log('[AUTH] ✅ Both token and savedUser found');
          let userData = JSON.parse(savedUser);
          console.log('[AUTH] 👤 User data:', userData.name, `(ID: ${userData.id})`);

          // Apply persisted mode preference if it exists
          if (activeMode) {
            console.log(`[AUTH] 🔄 Applying persisted mode: ${activeMode}`);
            userData = { ...userData, isDriver: activeMode === 'driver' };
          }

          // Validate user data structure - support both email and phone-based users
          if (userData.id && userData.name && (userData.email || userData.phone)) {
            console.log('[AUTH] ✅ User data is valid, setting user state...');
            // Load cached user first for immediate UI rendering
            setUser(userData);
            console.log('[AUTH] ✅ User state set, now validating token...');

            // Validate token with backend (5-second timeout)
            try {
              console.log('[AUTH] 🔐 Starting token validation with backend...');
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);

              const apiUrl =
                process.env.REACT_APP_API_URL ||
                (process.env.NODE_ENV === 'production'
                  ? 'https://toosila-backend-production.up.railway.app/api'
                  : 'http://localhost:5000/api');
              console.log('[AUTH] 🌐 API URL:', apiUrl);

              const response = await fetch(`${apiUrl}/auth/me`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                signal: controller.signal,
              });

              clearTimeout(timeoutId);

              console.log('[AUTH] 📡 Token validation response status:', response.status);

              if (!response.ok) {
                // Token is invalid or expired
                console.error('[AUTH] ❌ Token validation FAILED!');
                console.error('[AUTH] Status:', response.status);
                console.error('[AUTH] Token used:', token.substring(0, 30) + '...');
                const errorBody = await response.text();
                console.error('[AUTH] Response body:', errorBody);
                console.warn('[AUTH] ⚠️ CLEARING localStorage and logging out user');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                localStorage.removeItem('activeMode');
                setUser(null);
              } else {
                // Token is valid, update user data if needed
                const result = await response.json();
                console.log('[AUTH] ✅ Token validation SUCCESS!');
                console.log('[AUTH] User from server:', result.data?.user?.name);
                if (result.data && result.data.user) {
                  let freshUserData = result.data.user;

                  // Re-apply mode preference to fresh data from server
                  const currentActiveMode = localStorage.getItem('activeMode');
                  if (currentActiveMode) {
                    console.log('[AUTH] 🔄 Re-applying mode preference:', currentActiveMode);
                    freshUserData = { ...freshUserData, isDriver: currentActiveMode === 'driver' };
                  }

                  console.log('[AUTH] 💾 Saving fresh user data to localStorage');
                  localStorage.setItem('currentUser', JSON.stringify(freshUserData));
                  setUser(freshUserData);
                  console.log('[AUTH] ✅ User restored successfully!');
                }
              }
            } catch (tokenError) {
              // Network error or timeout - keep cached user (offline mode)
              // Token will be validated on next API call
              console.warn(
                '[AUTH] ⚠️ Token validation failed (network error):',
                tokenError.message
              );
              console.log('[AUTH] 📴 Keeping cached user (offline mode)');
            }
          } else {
            console.error('[AUTH] ❌ User data validation FAILED - missing required fields');
            console.error('[AUTH] User data:', userData);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('token');
            localStorage.removeItem('activeMode');
          }
        } else {
          console.log('[AUTH] ❌ No token or savedUser found - user not logged in');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('activeMode');
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

      // Default active mode based on registration
      const isDriver = data.data.user.userType === 'driver' || data.data.user.isDriver;
      localStorage.setItem('activeMode', isDriver ? 'driver' : 'passenger');

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

      // Reset active mode on new login
      localStorage.setItem('activeMode', userForStorage.isDriver ? 'driver' : 'passenger');

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
        console.log('[AUTH] 🔐 Direct login with token (OTP flow)');
        // Direct login with token and user object
        const token = credentialsOrToken;
        const userData = userDataOrNull;

        console.log('[AUTH] 💾 Saving to localStorage...');
        console.log('[AUTH] Token to save:', token ? token.substring(0, 30) + '...' : 'NULL');
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Reset active mode on new login
        const mode = userData.isDriver ? 'driver' : 'passenger';
        localStorage.setItem('activeMode', mode);

        // VERIFY token was saved
        const verifyToken = localStorage.getItem('token');
        const verifyUser = localStorage.getItem('currentUser');
        console.log(
          '[AUTH] ✅ Verification - token saved:',
          verifyToken ? verifyToken.substring(0, 30) + '...' : '❌ NULL'
        );
        console.log('[AUTH] ✅ Verification - user saved:', verifyUser ? '✅ YES' : '❌ NULL');

        console.log('[AUTH] ✅ Login successful - token and user saved to localStorage');
        console.log('[AUTH] User:', userData.name, '| Mode:', mode);

        setUser(userData);

        setLoading(false);
        return { success: true, user: userData };
      }

      // Traditional email/password login
      console.log('[AUTH] 🔐 Email/password login');
      const { email, password } = credentialsOrToken;

      if (!email || !password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
      }

      // Call API
      const data = await authAPI.login(email, password);

      console.log('[AUTH] 💾 Saving to localStorage...');
      console.log(
        '[AUTH] Token to save:',
        data.data.token ? data.data.token.substring(0, 30) + '...' : 'NULL'
      );
      // Save token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));

      // Reset active mode on new login
      const isDriver = data.data.user.isDriver;
      const mode = isDriver ? 'driver' : 'passenger';
      localStorage.setItem('activeMode', mode);

      // VERIFY token was saved
      const verifyToken = localStorage.getItem('token');
      const verifyUser = localStorage.getItem('currentUser');
      console.log(
        '[AUTH] ✅ Verification - token saved:',
        verifyToken ? verifyToken.substring(0, 30) + '...' : '❌ NULL'
      );
      console.log('[AUTH] ✅ Verification - user saved:', verifyUser ? '✅ YES' : '❌ NULL');

      console.log('[AUTH] ✅ Login successful - token and user saved to localStorage');
      console.log('[AUTH] User:', data.data.user.name, '| Mode:', mode);

      setUser(data.data.user);

      setLoading(false);
      return { success: true, user: data.data.user };
    } catch (error) {
      console.error('[AUTH] ❌ Login failed:', error.message);
      setError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('activeMode');
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
      console.log('[DEBUG] updateProfile response:', JSON.stringify(data, null, 2));

      // Update current user
      let updatedUser = data.data.user;

      // Preserve active mode override if it exists
      const activeMode = localStorage.getItem('activeMode');
      if (activeMode) {
        updatedUser = { ...updatedUser, isDriver: activeMode === 'driver' };
      }

      console.log('[DEBUG] Updated user:', JSON.stringify(updatedUser, null, 2));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Update token if provided (e.g. when role changes)
      if (data.data.token) {
        console.log('[DEBUG] New token received, storing...');
        localStorage.setItem('token', data.data.token);
      } else {
        console.warn('[DEBUG] No token in response! Old token will remain.');
      }

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

  // Toggle user type (driver <-> passenger) - CLIENT SIDE ONLY
  // Accepts optional desiredIsDriver boolean to set specific mode
  const toggleUserType = async (desiredIsDriver = null) => {
    if (!user) return { success: false, error: 'غير مسجل دخول' };

    try {
      console.log('[DEBUG] Client-side toggleUserType called', { desiredIsDriver });
      const currentIsDriver = user.isDriver;

      // Determine new state
      const newIsDriver = desiredIsDriver !== null ? desiredIsDriver : !currentIsDriver;

      // If no change needed, return success immediately
      if (newIsDriver === currentIsDriver) {
        return { success: true, user };
      }

      const newMode = newIsDriver ? 'driver' : 'passenger';

      console.log(`[DEBUG] Switching mode to ${newMode}`);

      // Update local storage for persistence
      localStorage.setItem('activeMode', newMode);

      // Update user state immediately without API call
      const updatedUser = { ...user, isDriver: newIsDriver };

      // Update currentUser in localStorage to keep them in sync
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error toggling user type:', error);
      return { success: false, error: error.message };
    }
  };

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
    toggleUserType,
    getUserById,
    isAuthenticated,
    isDriver,
    isPassenger,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
