import { authService } from "./authService";

// Initialize Stytch client with environment variables
const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || "";
const stytchEnv = process.env.NEXT_PUBLIC_STYTCH_PROJECT_ENV || "test";

// Enhanced environment variable logging
console.log(
  "ENV CHECK - Project Env:",
  process.env.NEXT_PUBLIC_STYTCH_PROJECT_ENV
);
console.log(
  "ENV CHECK - Project Env Type:",
  typeof process.env.NEXT_PUBLIC_STYTCH_PROJECT_ENV
);
console.log(
  "ENV CHECK - Public Token:",
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
);
console.log(
  "ENV CHECK - Public Token Type:",
  typeof process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
);
console.log("ENV CHECK - Resolved Env:", stytchEnv);
console.log("ENV CHECK - Resolved Token:", publicToken);

// Use dynamic import for Next.js compatibility
let stytchClient: any = null;

// Initialize the client only on the client side
if (typeof window !== "undefined") {
  const initializeStytchClient = async () => {
    try {
      // Dynamically import the Stytch client
      const { createStytchHeadlessClient } = await import(
        "@stytch/nextjs/headless"
      );

      // Create the Stytch client with the public token
      stytchClient = createStytchHeadlessClient(publicToken);
      console.log("Stytch client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Stytch client:", error);
    }
  };

  // Initialize the client
  initializeStytchClient();
}

// For test environment, we can retrieve magic links directly
const retrieveTestMagicLink = async (email: string): Promise<string | null> => {
  try {
    // This is only for development/testing purposes
    // In test mode, we can simulate clicking the magic link
    console.log("Retrieving test magic link for:", email);

    // In test mode, we can construct a test magic link
    // Format: https://test.stytch.com/magic_links/{token}?stytch_token_type=magic_links
    const token = `ml-${Math.random().toString(36).substring(2, 15)}`;
    const magicLink = `${window.location.origin}/authenticate?token=${token}&stytch_token_type=magic_links`;

    console.log("Test magic link:", magicLink);
    return magicLink;
  } catch (error) {
    console.error("Error retrieving test magic link:", error);
    return null;
  }
};

// Helper function to ensure client is initialized
const ensureClient = async () => {
  if (typeof window === "undefined") {
    throw new Error("Stytch client cannot be used on the server side");
  }

  if (!stytchClient) {
    // If client isn't initialized yet, try to initialize it
    const { createStytchHeadlessClient } = await import(
      "@stytch/nextjs/headless"
    );
    stytchClient = createStytchHeadlessClient(publicToken);
  }

  return stytchClient;
};

export const stytchService = {
  /**
   * Initiates SMS login by sending a verification code
   * @param phoneNumber The phone number to send the verification code to
   * @returns The phone ID for verification
   */
  async initiateSMSLogin(phoneNumber: string): Promise<string> {
    const client = await ensureClient();

    try {
      const response = await client.otps.sms.loginOrCreate({
        phone_number: phoneNumber,
      });

      return response.phone_id;
    } catch (error) {
      console.error("Error initiating SMS login:", error);
      throw error;
    }
  },

  /**
   * Authenticates a user with an SMS verification code
   * @param phoneId The phone ID from the initiation step
   * @param code The verification code entered by the user
   */
  async authenticateWithSMS(phoneId: string, code: string): Promise<void> {
    const client = await ensureClient();

    try {
      const response = await client.otps.authenticate({
        method_id: phoneId,
        code,
        session_duration_minutes: 60 * 24 * 7, // 1 week
      });

      // Store the session token
      authService.authenticateWithStytch(response.session_token);
    } catch (error) {
      console.error("Error authenticating with SMS:", error);
      throw error;
    }
  },

  /**
   * Initiates email login by sending a magic link
   * @param email The email to send the magic link to
   */
  async initiateEmailLogin(email: string): Promise<void> {
    const client = await ensureClient();

    try {
      // Send the magic link
      await client.magicLinks.email.loginOrCreate({
        email,
        login_magic_link_url: `${window.location.origin}/authenticate`,
        signup_magic_link_url: `${window.location.origin}/authenticate`,
      });
      console.log("Email magic link sent successfully");

      // For test environment only, create a test magic link
      if (stytchEnv === "test") {
        const token = `ml-${Math.random().toString(36).substring(2, 15)}`;
        const magicLink = `${window.location.origin}/authenticate?token=${token}&stytch_token_type=magic_links`;

        console.log("Test magic link:", magicLink);
        localStorage.setItem("testMagicLink", magicLink);
      }
    } catch (error) {
      console.error("Error initiating email login:", error);
      throw error;
    }
  },

  /**
   * Authenticates a user with a magic link token
   * @param token The token from the magic link
   */
  async authenticateWithMagicLink(
    token: string,
    tokenType: string
  ): Promise<void> {
    const client = await ensureClient();

    try {
      // In test mode, we can simulate authentication
      if (stytchEnv === "test" && window.location.hostname === "localhost") {
        console.log(
          "Test mode: Simulating successful magic link authentication"
        );
        return this.simulateEmailLogin("test@example.com");
      }

      // Ensure token is a string and not undefined
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token: Token must be a string");
      }

      console.log(
        `Authenticating with token: ${token.substring(
          0,
          5
        )}... (type: ${tokenType})`
      );

      const response = await client.magicLinks.authenticate({
        token,
        session_duration_minutes: 60 * 24 * 7, // 1 week
      });

      // Store the session token
      authService.authenticateWithStytch(response.session_token);
    } catch (error) {
      console.error("Error authenticating with magic link:", error);
      throw error;
    }
  },

  /**
   * Authenticate OAuth session
   * Following Stytch documentation: https://stytch.com/docs/api/oauth-authenticate
   */
  async authenticateOAuth(token: any, tokenType: string): Promise<void> {
    const client = await ensureClient();

    try {
      // Convert token to string if it's not already
      let tokenStr = token;

      // Handle array case
      if (Array.isArray(token)) {
        tokenStr = token[0];
      }

      // Force to string type
      tokenStr = String(tokenStr);

      console.log("OAuth token type before processing:", typeof token);
      console.log("OAuth token value before processing:", token);
      console.log("OAuth token type after processing:", typeof tokenStr);
      console.log("OAuth token value after processing:", tokenStr);
      console.log("OAuth token length:", tokenStr.length);

      if (!tokenStr || tokenStr === "undefined" || tokenStr === "null") {
        throw new Error("Invalid OAuth token: empty or invalid value");
      }

      // Use the raw client.oauth.authenticate method with a plain object
      // This avoids any potential SDK validation issues
      const response = await client.oauth.authenticate({
        token: tokenStr,
        session_duration_minutes: 60 * 24 * 7, // 1 week
      });

      console.log("OAuth authentication successful");

      // Store the session token
      authService.authenticateWithStytch(response.session_token);
    } catch (error) {
      console.error("Error authenticating with OAuth:", error);
      throw error;
    }
  },

  /**
   * Start OAuth flow for Google
   * Following Stytch documentation: https://stytch.com/docs/quickstarts/nextjs
   */
  async startGoogleOAuth(): Promise<void> {
    const client = await ensureClient();
    try {
      // Configure OAuth parameters for Google according to Stytch docs
      const params = {
        login_redirect_url: `${window.location.origin}/authenticate`,
        signup_redirect_url: `${window.location.origin}/authenticate`,
      };

      console.log("Starting Google OAuth with params:", params);

      // Start the OAuth flow
      await client.oauth.google.start(params);
    } catch (error) {
      console.error("Error starting Google OAuth:", error);
      throw error;
    }
  },

  /**
   * Start OAuth flow for Apple
   * Following Stytch documentation: https://stytch.com/docs/quickstarts/nextjs
   */
  async startAppleOAuth(): Promise<void> {
    const client = await ensureClient();
    try {
      // Configure OAuth parameters for Apple according to Stytch docs
      const params = {
        login_redirect_url: `${window.location.origin}/authenticate`,
        signup_redirect_url: `${window.location.origin}/authenticate`,
      };

      console.log("Starting Apple OAuth with params:", params);

      // Start the OAuth flow
      await client.oauth.apple.start(params);
    } catch (error) {
      console.error("Error starting Apple OAuth:", error);
      throw error;
    }
  },

  /**
   * Simulate email login for testing purposes
   * @param email The email to simulate login for
   */
  async simulateEmailLogin(email: string): Promise<void> {
    // This is only for development/testing purposes
    console.log("Simulating email login for:", email);

    // Create a fake session token
    const sessionToken = `session-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Store the session token
    authService.authenticateWithStytch(sessionToken);
  },
};
