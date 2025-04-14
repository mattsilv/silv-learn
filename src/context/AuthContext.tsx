import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AnswerSelections, LearningStyleResults } from '../types/quiz'; // Import necessary types

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

// --- Duplicated types/constants from ResultsPage for saving pending results --- 
// (Ideally, move these to a shared location like src/types later)
interface QuizResultPayload {
  quizType: string;
  quizVersion: string;
  userId: string | null; // userId will be added here
  scores: { a: number; b: number; c: number; d: number };
  results: LearningStyleResults;
  prioritizedAnswers: AnswerSelections;
  timestamp: string;
}
type PendingQuizResultPayload = Omit<QuizResultPayload, 'userId'>; // Type stored in localStorage
const PENDING_RESULTS_KEY = 'pendingQuizResults';
const AUTH_TOKEN_KEY = 'authToken';
// --- End Duplicated types/constants ---

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize token state from localStorage
  const [token, setToken] = useState<string | null>(() => {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (e) {
        console.error("Error reading localStorage:", e);
        return null;
    }
  });
  const [user, setUser] = useState<UserMeInfo | null>(null); // User state
  const [isLoading, setIsLoading] = useState<boolean>(!!token); // Start loading if initial token exists

  // --- Helper function to save results (similar to ResultsPage) ---
  const savePendingQuizResultsAPI = useCallback(async (payload: QuizResultPayload, currentToken: string | null) => {
      if (!currentToken) {
          console.error("[AuthContext] Cannot save pending results without a token.");
          return;
      }
      console.log("[AuthContext] Attempting to save PENDING quiz results:", payload);
      const apiUrl = import.meta.env.VITE_WORKER_API_URL;
      const endpoint = `${apiUrl}/api/results/submit`;

      // REMOVE Simulation delay
      // await new Promise(resolve => setTimeout(resolve, 500));

      try {
          // Enable the actual fetch call
          const headers: HeadersInit = { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}` // Use current token
          };
                    
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(payload),
          });

          if (response.ok) {
              console.log("[AuthContext] Pending quiz results saved successfully.");
              // No need to set state here, just log success/failure
              // The localStorage item was already removed before this call was made.
          } else {
              console.error("[AuthContext] Failed to save pending quiz results:", response.status, await response.text());
              // Optional: Consider re-adding to localStorage or notifying user?
              // For now, we just log the error. The item is already removed from localStorage.
          }
          
         /* --- Remove Simulation --- 
         console.log("[AuthContext] Simulating successful PENDING API save.");
         --- End Simulation --- */

      } catch (error) {
          console.error("[AuthContext] Error calling save API for pending results:", error);
          // Optional: Error handling strategy needed.
      }
  }, []); // No token dependency here, passed as arg
  // --- End Helper function ---

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

        // --- Check for pending results after setting user ---
        try {
            const pendingResultsJSON = localStorage.getItem(PENDING_RESULTS_KEY);
            if (pendingResultsJSON) {
                console.log('[AuthContext] Found pending quiz results in localStorage.');
                const pendingPayload: PendingQuizResultPayload = JSON.parse(pendingResultsJSON);
                
                // Remove immediately after parsing to prevent duplicates, before async call
                try {
                     localStorage.removeItem(PENDING_RESULTS_KEY); 
                     console.log('[AuthContext] Removed pending results from localStorage.');
                } catch (removeError) {
                    console.error("[AuthContext] Error removing pending results from localStorage:", removeError);
                    // Decide if we should proceed if removal fails? Let's proceed for now.
                }

                // Construct full payload with user ID
                const fullPayload: QuizResultPayload = {
                    ...pendingPayload,
                    userId: userData.id, // Add the user ID
                };

                // Call the save function (don't await here, let it run in background)
                savePendingQuizResultsAPI(fullPayload, currentToken);
            }
        } catch (e) {
            console.error("[AuthContext] Error processing pending quiz results:", e);
             // If parsing/processing fails, maybe remove the invalid item?
             try { localStorage.removeItem(PENDING_RESULTS_KEY); } catch (removeError) { /* ignore */ }
        }
        // --- End check for pending results ---

      } else if (response.status === 401) {
        console.warn('[AuthContext] Unauthorized fetching user data. Logging out.');
        // Token is invalid or expired, clear it from state and localStorage
        setToken(null);
        setUser(null);
        try {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(PENDING_RESULTS_KEY); // Also clear pending results on logout/invalid token
        } catch (e) {
            console.error("Error removing item from localStorage:", e);
        }
      } else {
        // Handle other errors (404, 500, etc.)
        const errorData = await response.json().catch(() => ({})); // Try to parse error JSON
        console.error(`[AuthContext] Error fetching user data: ${response.status}`, errorData);
        setUser(null); // Clear user data on error, but keep potentially invalid token? Maybe clear token too?
        // Let's clear the token here as well if user fetch fails for reasons other than 401
        setToken(null);
        try {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(PENDING_RESULTS_KEY); // Also clear pending results
        } catch (e) {
            console.error("Error removing item from localStorage:", e);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Network or other error fetching user data:', error);
      setUser(null); // Clear user data on network error
      // Keep token or clear it? Clearing might be safer but could annoy user if it's a temporary network issue.
      // Let's keep the token for now on network errors, maybe add retry later.
      // setToken(null);
      // localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] Finished fetching user data.');
    }
  }, [savePendingQuizResultsAPI]); // Added savePendingQuizResultsAPI dependency

  // Callback to set token AND trigger user fetch, AND update localStorage
  const setTokenCallback = useCallback((newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      } catch (e) {
          console.error("Error setting item in localStorage:", e);
      }
      fetchUserData(newToken); // This will now also check for pending results
    } else {
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(PENDING_RESULTS_KEY); // Clear pending on explicit token removal too
      } catch (e) {
          console.error("Error removing item from localStorage:", e);
      }
      setUser(null);
    }
  }, [fetchUserData]);

  // Logout function - clears state and localStorage
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(PENDING_RESULTS_KEY); // Also clear pending results on logout
    } catch (e) {
        console.error("Error removing item from localStorage:", e);
    }
    console.log('[AuthContext] User logged out.');
  }, []);

  // Effect to fetch user on initial load IF a token exists from localStorage
  useEffect(() => {
    // Trigger fetch if we have a token but don't have user data yet.
    // The isLoading check is removed here; fetchUserData handles its own loading state.
    if (token && !user) { 
      console.log('[AuthContext Initial Load Effect] Found initial token, attempting to fetch user data...')
      fetchUserData(token);
    }
    // Dependency array should include things that determine IF we should fetch,
    // primarily the presence of the token and absence of user data.
    // fetchUserData is included because it's called by the effect.
  }, [token, user, fetchUserData]); // Removed isLoading from dependencies

  const value = {
    token,
    user, // Expose user
    isLoading, // Expose loading state
    setTokenCallback,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 