import { useState, useEffect } from "react";
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { AppleIcon } from "../components/icons/AppleIcon";
import { GoogleIcon } from "../components/icons/GoogleIcon";
import { authService } from "../utils/authService";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => {
  const [loginMethod, setLoginMethod] = useState<"email" | "phone" | null>(
    null
  );
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [step, setStep] = useState<"initial" | "verification" | "emailSent">(
    "initial"
  );
  const [error, setError] = useState("");
  const [testMagicLink, setTestMagicLink] = useState<string | null>(null);
  const [stytchService, setStytchService] = useState<any>(null);

  useEffect(() => {
    // Dynamically import stytchService on the client side
    const loadStytchService = async () => {
      const { stytchService } = await import("../utils/stytchService");
      setStytchService(stytchService);
    };

    loadStytchService();

    // Check if there's a test magic link in localStorage
    const storedTestMagicLink = localStorage.getItem("testMagicLink");
    if (storedTestMagicLink) {
      setTestMagicLink(storedTestMagicLink);
    }
  }, [step]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailValue(e.target.value);
    setError("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneValue(e.target.value);
    setError("");
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!stytchService) {
        throw new Error("Stytch service not initialized");
      }

      if (loginMethod === "email") {
        // Send magic link email
        await stytchService.initiateEmailLogin(emailValue);
        setStep("emailSent");

        // Check if there's a test magic link in localStorage
        const storedTestMagicLink = localStorage.getItem("testMagicLink");
        if (storedTestMagicLink) {
          setTestMagicLink(storedTestMagicLink);
        }
      } else if (loginMethod === "phone") {
        // Send SMS verification code
        const phoneId = await stytchService.initiateSMSLogin(phoneValue);
        setPhoneId(phoneId);
        setStep("verification");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!stytchService) {
        throw new Error("Stytch service not initialized");
      }

      await stytchService.authenticateWithSMS(phoneId, verificationCode);
      onClose();
      // Dispatch a custom event to notify other components that the user has logged in
      window.dispatchEvent(
        new CustomEvent("userLoggedIn", {
          detail: { method: "phone" },
        })
      );
    } catch (error) {
      console.error("Verification error:", error);
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      // For now, we'll simulate a successful Google sign-in
      // In a real implementation, this would redirect to Google OAuth
      setTimeout(() => {
        // Simulate successful authentication
        const mockSessionToken = "google-session-token";
        authService.authenticateWithStytch(mockSessionToken);
        onClose();
        // Dispatch a custom event to notify other components that the user has logged in
        window.dispatchEvent(
          new CustomEvent("userLoggedIn", {
            detail: { method: "google" },
          })
        );
      }, 1000);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("An error occurred with Google sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError("");
    setIsLoading(true);

    try {
      // For now, we'll simulate a successful Apple sign-in
      // In a real implementation, this would redirect to Apple OAuth
      setTimeout(() => {
        // Simulate successful authentication
        const mockSessionToken = "apple-session-token";
        authService.authenticateWithStytch(mockSessionToken);
        onClose();
        // Dispatch a custom event to notify other components that the user has logged in
        window.dispatchEvent(
          new CustomEvent("userLoggedIn", {
            detail: { method: "apple" },
          })
        );
      }, 1000);
    } catch (error) {
      console.error("Apple sign-in error:", error);
      setError("An error occurred with Apple sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSimulateLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!stytchService) {
        throw new Error("Stytch service not initialized");
      }

      await stytchService.simulateEmailLogin(emailValue);
      onClose();
      // Dispatch a custom event to notify other components that the user has logged in
      window.dispatchEvent(
        new CustomEvent("userLoggedIn", {
          detail: { method: "email" },
        })
      );
    } catch (error) {
      console.error("Simulate login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const renderEmailSentStep = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Email Sent</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="text-center mb-6">
        <div className="mx-auto bg-indigo-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
          <EnvelopeIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">Check your email</h3>
        <p className="text-gray-600">
          We've sent a magic link to <strong>{emailValue}</strong>. Click the
          link in the email to sign in.
        </p>
      </div>

      {process.env.NEXT_PUBLIC_STYTCH_ENV === "test" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-medium text-yellow-800 mb-2">Test Environment</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Since you're in test mode, you can use the button below to simulate
            clicking the magic link:
          </p>
          <div className="mt-4">
            <button
              onClick={handleSimulateLogin}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Simulating..." : "Simulate Login (Test Only)"}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setStep("initial")}
        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
      >
        Back to Sign In
      </button>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Verify Phone</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <form onSubmit={handleVerifyCode}>
        <div className="mb-4">
          <label
            htmlFor="verificationCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Verification Code
          </label>
          <input
            id="verificationCode"
            type="text"
            value={verificationCode}
            onChange={handleVerificationCodeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter code"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors mb-3"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </button>
        <button
          type="button"
          onClick={() => setStep("initial")}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
      </form>
    </div>
  );

  const renderInitialStep = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Sign In</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={() => setLoginMethod("email")}
          className={`w-full flex items-center px-4 py-3 border rounded-md transition-colors ${
            loginMethod === "email"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-3" />
          <span>Continue with Email</span>
        </button>

        <button
          onClick={() => setLoginMethod("phone")}
          className={`w-full flex items-center px-4 py-3 border rounded-md transition-colors ${
            loginMethod === "phone"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <PhoneIcon className="h-5 w-5 text-gray-500 mr-3" />
          <span>Continue with Phone</span>
        </button>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          <GoogleIcon className="h-5 w-5 mr-3" />
          <span>Continue with Google</span>
        </button>

        <button
          onClick={handleAppleSignIn}
          className="w-full flex items-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          <AppleIcon className="h-5 w-5 mr-3" />
          <span>Continue with Apple</span>
        </button>
      </div>

      {loginMethod && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {loginMethod === "email" ? (
              <>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={emailValue}
                  onChange={handleEmailChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your email"
                  required
                />
              </>
            ) : (
              <>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your phone number"
                  required
                />
              </>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            disabled={isLoading || !stytchService}
          >
            {isLoading
              ? "Sending..."
              : loginMethod === "email"
              ? "Send Magic Link"
              : "Send Code"}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {step === "initial" && renderInitialStep()}
        {step === "verification" && renderVerificationStep()}
        {step === "emailSent" && renderEmailSentStep()}
      </div>
    </div>
  );
};

export default LoginModal;
