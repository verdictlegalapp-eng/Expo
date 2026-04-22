import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'client' | 'attorney';

interface UserContextType {
  userRole: UserRole;
  setRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('client');

  const setRole = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <UserContext.Provider value={{ userRole, setRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
