import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'legal' | 'viewer';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department: string | null;
  phone: string | null;
}

interface AccessControlContextType {
  userProfile: UserProfile | null;
  hasRole: (role: UserRole) => boolean;
  canAccess: (requiredRoles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  canEdit: boolean;
  canDelete: boolean;
  loading: boolean;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole) => {
    return userProfile?.role === role;
  };

  const canAccess = (requiredRoles: string[]) => {
    if (!userProfile) return false;
    return requiredRoles.includes(userProfile.role);
  };

  const hasPermission = (permission: string) => {
    if (!userProfile) return false;
    
    // Define permission matrix
    const permissions = {
      admin: ['create', 'edit', 'delete', 'view', 'share', 'download', 'create_document'],
      legal: ['edit', 'view', 'share', 'download'],
      viewer: ['view']
    };
    
    return permissions[userProfile.role]?.includes(permission) || false;
  };

  const canEdit = hasPermission('edit');
  const canDelete = hasPermission('delete');

  const value = {
    userProfile,
    hasRole,
    canAccess,
    hasPermission,
    canEdit,
    canDelete,
    loading,
  };

  return (
    <AccessControlContext.Provider value={value}>
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error('useAccessControl must be used within an AccessControlProvider');
  }
  return context;
};

// HOC for role-based components
export const withRoleAccess = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: string[]
) => {
  return (props: P) => {
    const { canAccess } = useAccessControl();
    
    if (!canAccess(requiredRoles)) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">You don't have permission to access this feature.</p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};
