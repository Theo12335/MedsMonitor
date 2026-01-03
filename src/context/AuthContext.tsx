"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "caregiver" | "patient" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roomNumber?: string; // For patients
  department?: string; // For caregivers
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // TODO: Implement real session check with backend
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to backend
      // This is scaffolding - simulates a successful login
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock user data based on role
      const mockUser: User = {
        id: `user_${Date.now()}`,
        name: role === "caregiver" ? "Jane Smith" : "John Doe",
        email: email,
        role: role,
        ...(role === "patient" ? { roomNumber: "101A" } : { department: "General Care" }),
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
