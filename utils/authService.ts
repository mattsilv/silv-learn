import axios from "axios";

// API URLs
const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL_PROD
    : process.env.NEXT_PUBLIC_API_URL;

// Types
export interface User {
  id: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  emails: Array<{
    email: string;
    is_primary: boolean;
    is_verified: boolean;
  }>;
  roles: Array<{
    name: string;
    description: string | null;
  }> | null;
  created_at: string;
  updated_at: string | null;
  user_metadata: Record<string, any> | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth service functions
export const authService = {
  // Authenticate with Stytch session token
  authenticateWithStytch: async (
    sessionToken: string
  ): Promise<AuthResponse> => {
    try {
      // In test mode, we can simulate a successful authentication
      if (process.env.NEXT_PUBLIC_STYTCH_ENV === "test") {
        console.log("Test mode: Simulating successful API authentication");

        // Create a fake auth response
        const testAuthResponse: AuthResponse = {
          access_token: `test-token-${Date.now()}`,
          token_type: "bearer",
          user_id: "test-user-id",
          username: "test-user",
        };

        // Store token in localStorage
        localStorage.setItem("token", testAuthResponse.access_token);

        return testAuthResponse;
      }

      // Real authentication with API
      const response = await api.post("/auth/stytch/token", {
        session_token: sessionToken,
      });

      // Store token in localStorage
      localStorage.setItem("token", response.data.access_token);

      return response.data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  },

  // Get current user info
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      // In test mode, return a fake user
      if (
        process.env.NEXT_PUBLIC_STYTCH_ENV === "test" &&
        token.startsWith("test-token")
      ) {
        return {
          id: "test-user-id",
          username: "test-user",
          full_name: "Test User",
          is_active: true,
          emails: [
            {
              email: "test@example.com",
              is_primary: true,
              is_verified: true,
            },
          ],
          roles: [
            {
              name: "user",
              description: "Regular user",
            },
          ],
          created_at: new Date().toISOString(),
          updated_at: null,
          user_metadata: null,
        };
      }

      const response = await api.get("/auth/users/me");
      return response.data;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};
