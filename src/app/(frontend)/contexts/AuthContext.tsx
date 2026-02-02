"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, AuthState } from '../lib/types';
import usersData from '../data/users.json';

interface AuthContextType extends AuthState {
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
  canEdit: () => boolean;
  canManageProjects: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get default user based on role
const getUserByRole = (role: UserRole): User => {
  const user = usersData.users.find(u => u.role === role);
  return user as User || usersData.users[0] as User;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: getUserByRole('superadmin'),
    isAuthenticated: true,
    isLoading: false,
  });

  const switchRole = (role: UserRole) => {
    const user = getUserByRole(role);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const getRolePermissions = (role: UserRole): string[] => {
    const roleData = usersData.roles[role];
    return roleData?.permissions || [];
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    const permissions = getRolePermissions(state.user.role);
    return permissions.includes(permission);
  };

  const canEdit = (): boolean => {
    return hasPermission('edit');
  };

  const canManageProjects = (): boolean => {
    return hasPermission('manage_projects');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        switchRole,
        hasPermission,
        canEdit,
        canManageProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
