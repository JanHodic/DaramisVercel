"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UIUser, UIUserRole, UIAuthState } from '../lib/types';
import usersData from '../data/users.json';

interface AuthContextType extends UIAuthState {
  switchRole: (role: UIUserRole) => void;
  hasPermission: (permission: string) => boolean;
  canEdit: () => boolean;
  canManageProjects: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get default user based on role
const getUserByRole = (role: UIUserRole): UIUser => {
  const user = usersData.users.find(u => u.role === role);
  return user as UIUser || usersData.users[0] as UIUser;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIAuthState>({
    user: getUserByRole('superadmin'),
    isAuthenticated: true,
    isLoading: false,
  });

  const switchRole = (role: UIUserRole) => {
    const user = getUserByRole(role);
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const getRolePermissions = (role: UIUserRole): string[] => {
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
