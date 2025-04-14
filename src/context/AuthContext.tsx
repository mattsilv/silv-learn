import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Define User type based on backend schema
interface UserMeInfo {
  id: string;
  email: string;
  name?: string | null; 
}

interface AuthContextType {
  token: string | null;
  user: UserMeInfo | null; // Add user state
  isLoading: boolean; // Add loading state
  setTokenCallback: (newToken: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserMeInfo | null>(null); // User state
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

  // Function to fetch user data
  const fetchUserData = useCallback(async (currentToken: string) => {
    if (!currentToken) return;
    
    setIsLoading(true);
    console.log('[AuthContext] Fetching user data...');
    try {
      const apiUrl = import.meta.env.VITE_WORKER_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/me`, { 
        headers: { 
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'application/json', // Good practice
        }
      });

      if (response.ok) { // Status 200-299
        const userData: UserMeInfo = await response.json();
        console.log('[AuthContext] User data received:', userData);
        setUser(userData);
      } else if (response.status === 401) {
        console.warn('[AuthContext] Unauthorized fetching user data. Logging out.');
        // Token is invalid or expired, clear it
        setToken(null); 
        setUser(null);
      } else {
        // Handle other errors (404, 500, etc.)
        const errorData = await response.json().catch(() => ({})); // Try to parse error JSON
        console.error(`[AuthContext] Error fetching user data: ${response.status}`, errorData);
        setUser(null); // Clear user data on error
      }
    } catch (error) {
      console.error('[AuthContext] Network or other error fetching user data:', error);
      setUser(null); // Clear user data on network error
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] Finished fetching user data.');
    }
  }, []); // No dependencies needed for the function itself

  // Callback to set token AND trigger user fetch
  const setTokenCallback = useCallback((newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      // Fetch user data when a new token is set
      fetchUserData(newToken); 
    } else {
      // Clear user data if token is removed
      setUser(null); 
    }
    // Note: localStorage logic is still commented out
  }, [fetchUserData]); // Add fetchUserData as dependency

  // Logout function - now also clears user
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    // Optional: Clear localStorage if used
    // localStorage.removeItem('authToken');
    console.log('[AuthContext] User logged out.');
  }, []);

  // Effect to fetch user on initial load IF a token exists (e.g., from localStorage)
  // This part is currently inactive as we don't initialize token from storage
  // useEffect(() => {
  //   const initialToken = localStorage.getItem('authToken');
  //   if (initialToken) {
  //     setToken(initialToken);
  //     fetchUserData(initialToken);
  //   }
  // }, [fetchUserData]);

  const value = {
    token,
    user, // Expose user
    isLoading, // Expose loading state
    setTokenCallback,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 