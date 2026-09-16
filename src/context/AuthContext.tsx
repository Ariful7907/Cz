import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { storage, subscribeToStorage } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password?: string) => boolean;
  signup: (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    avatar?: string;
    bio?: string;
    referralCode?: string;
  }) => { success: boolean; error?: string; user?: User };
  logout: () => void;
  switchUser: (userId: string) => void;
  switchAccount: (userId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  deleteAccount: () => void;
  forgotPassword: (email: string) => boolean;
  resetPassword: (email: string) => boolean;
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [availableUsers, setAvailableUsers] = useState<User[]>(() => storage.getUsers());

  // Listen to storage mutations
  useEffect(() => {
    const sync = () => {
      const allUsers = storage.getUsers();
      setAvailableUsers(allUsers);
      const cur = storage.getCurrentUser();
      setCurrentUser(cur);
    };
    return subscribeToStorage(sync);
  }, []);

  const login = useCallback((emailOrUsername: string, _password?: string): boolean => {
    const users = storage.getUsers();
    const query = emailOrUsername.trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.username.toLowerCase() === query.replace('@', '')
    );

    if (found) {
      if (found.isBanned) {
        return false;
      }
      storage.setCurrentUserId(found.id);
      setCurrentUser(found);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback((userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    avatar?: string;
    bio?: string;
    referralCode?: string;
  }): { success: boolean; error?: string; user?: User } => {
    const users = storage.getUsers();
    const cleanUsername = userData.username.trim().toLowerCase().replace('@', '');
    const cleanEmail = userData.email.trim().toLowerCase();

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Username is already taken' };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email is already registered' };
    }

    // Check referral code validity if provided
    if (userData.referralCode && userData.referralCode.trim()) {
      const code = userData.referralCode.trim().toUpperCase();
      const codes = storage.getReferralCodes();
      const codeRecord = codes.find((c) => c.code.toUpperCase() === code && c.isActive);
      if (!codeRecord) {
        return { success: false, error: 'The referral code entered is invalid or expired.' };
      }
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: userData.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: userData.password || 'password',
      avatar:
        userData.avatar ||
        `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=400&auto=format&fit=crop&q=80`,
      coverPhoto:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: userData.bio || 'New explorer on ConnectZone ✨ Connecting with wonderful minds!',
      role: 'user',
      followers: [],
      following: [],
      friends: [],
      friendRequestsReceived: [],
      friendRequestsSent: [],
      blockedUsers: [],
      privacySettings: {
        isPrivate: false,
        whoCanFollow: 'everyone',
        whoCanMessage: 'everyone',
        whoCanFriend: 'everyone',
      },
      createdAt: new Date().toISOString(),
      isOnline: true,
      isEmailVerified: true,
    };

    storage.createUser(newUser);

    // Auto-generate a unique referral code for the new user immediately
    const userCode = storage.getUserReferralCode(newUser.id);
    newUser.referralCode = userCode.code;

    // Track referral if registered with a valid code
    if (userData.referralCode && userData.referralCode.trim()) {
      storage.registerReferral(userData.referralCode.trim(), newUser.id);
    }

    storage.setCurrentUserId(newUser.id);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return { success: true, user: newUser };
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const switchUser = useCallback((userId: string) => {
    const target = storage.getUserById(userId);
    if (target) {
      storage.setCurrentUserId(target.id);
      setCurrentUser(target);
      setIsAuthenticated(true);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    const updated = storage.updateUser(currentUser.id, updates);
    setCurrentUser(updated);
  }, [currentUser.id]);

  const deleteAccount = useCallback(() => {
    storage.deleteUser(currentUser.id);
    const remaining = storage.getUsers();
    if (remaining.length > 0) {
      storage.setCurrentUserId(remaining[0].id);
      setCurrentUser(remaining[0]);
    } else {
      storage.resetAllData();
      setCurrentUser(storage.getCurrentUser());
    }
  }, [currentUser.id]);

  const forgotPassword = useCallback((email: string): boolean => {
    const users = storage.getUsers();
    return users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        signup,
        logout,
        switchUser,
        switchAccount: switchUser,
        updateProfile,
        deleteAccount,
        forgotPassword,
        resetPassword: forgotPassword,
        availableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
