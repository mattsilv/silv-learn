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

    // Log environment variables for debugging
    console.log(
      "ENV CHECK - Authenticate Page - Project Env:",
      process.env.NEXT_PUBLIC_STYTCH_PROJECT_ENV
    );
    console.log(
      "ENV CHECK - Authenticate Page - Public Token:",
      process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
    );
    console.log(
      "ENV CHECK - Authenticate Page - Token Type:",
      typeof process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
    );

    const authenticateUser = async () => {
      try {
        // Wait for router to be ready before accessing query params
        if (!router.isReady) return;

        console.log("Authentication query params:", router.query);

        // Get parameters from URL - following Stytch documentation
        const { token, stytch_token_type } = router.query;

        // For debug purposes
        for (const [key, value] of Object.entries(router.query)) {
          console.log(`Query param: ${key} = ${value}`);
        }

        // Dynamically import stytchService to avoid SSR issues
        const { stytchService } = await import("../utils/stytchService");

        // Handle magic link authentication - following Stytch docs
        if (token && stytch_token_type === "magic_links") {
          console.log("Processing magic link authentication");

          // Ensure token is a string
          const tokenStr = Array.isArray(token) ? token[0] : String(token);

          console.log("Magic link token type:", typeof tokenStr);
          console.log("Magic link token value:", tokenStr);

          if (!tokenStr) {
            throw new Error("Invalid token format");
          }

          await stytchService.authenticateWithMagicLink(
            tokenStr,
            "magic_links"
          );

          // Send login event
          window.dispatchEvent(
            new CustomEvent("userLoggedIn", {
              detail: { method: "email" },
            })
          );
        }
        // Handle OAuth authentication - following Stytch docs
        else if (token && stytch_token_type === "oauth") {
          console.log("Processing OAuth authentication with token");

          // Log raw token for debugging
          console.log("Raw OAuth token:", token);
          console.log("Raw OAuth token type:", typeof token);

          // Pass the raw token to the service - let the service handle conversion
          await stytchService.authenticateOAuth(token, "oauth");

          // Send login event
          window.dispatchEvent(
            new CustomEvent("userLoggedIn", {
              detail: { method: "oauth" },
            })
          );
        }
        // No valid authentication parameters
        else {
          console.warn("No valid authentication parameters found");
          // Don't throw an error here, just redirect to home
          router.push("/");
          return;
        }

        // Redirect to home page after successful authentication
        router.push("/");
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to authenticate. Please try again.");
        setIsLoading(false);
      }
    };

    // Only attempt authentication if router is ready
    if (router.isReady) {
      if (Object.keys(router.query).length > 0) {
        authenticateUser();
      } else {
        // No query parameters, redirect to home
        router.push("/");
      }
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
