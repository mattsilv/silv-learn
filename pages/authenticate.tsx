import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "../utils/authService";

const AuthenticatePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on the client side
    if (typeof window === "undefined") return;

    const authenticateUser = async () => {
      try {
        // Get token from URL
        const { token, stytch_token_type, code, state } = router.query;

        // Check if we have a valid authentication method
        const hasToken = token && typeof token === "string";
        const hasCode = code && typeof code === "string"; // Google OAuth returns code

        if (!hasToken && !hasCode) {
          setError("Invalid authentication parameters");
          setIsLoading(false);
          return;
        }

        // Dynamically import stytchService to avoid SSR issues
        const { stytchService } = await import("../utils/stytchService");

        // Handle different authentication methods
        if (hasToken) {
          const tokenType =
            typeof stytch_token_type === "string"
              ? stytch_token_type
              : "magic_links";

          if (tokenType === "oauth") {
            // Handle OAuth authentication (Google, Apple)
            await stytchService.authenticateOAuth(token, tokenType);
          } else {
            // Handle magic link authentication
            await stytchService.authenticateWithMagicLink(token, tokenType);
          }
        } else if (hasCode) {
          // Google OAuth with code flow
          console.log("Authenticating with OAuth code flow");
          const client = await import("@stytch/nextjs/headless");
          // The authentication step happens automatically via Stytch SDK
        }

        // Dispatch event for successful login
        window.dispatchEvent(
          new CustomEvent("userLoggedIn", {
            detail: { method: hasCode ? "google" : "email" },
          })
        );

        // Redirect to home page after successful authentication
        router.push("/");
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to authenticate. Please try again.");
        setIsLoading(false);
      }
    };

    // Only attempt authentication if we have query parameters
    if (router.isReady) {
      authenticateUser();
    }
  }, [router.isReady, router.query]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 max-w-md w-full bg-white shadow-lg rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Authenticating...
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we verify your identity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 max-w-md w-full bg-white shadow-lg rounded-lg">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Authentication Failed
            </h2>
            <p className="mt-2 text-center text-gray-600">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthenticatePage;
