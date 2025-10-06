import React, { useState, useEffect } from "react";
import App from "@/layouts/App";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Props {
  auth: Auth;
  flash?: {
    resent?: boolean;
    message?: string;
  };
}

export default function EmailVerification({ auth, flash }: Props) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check flash messages from session
    if (flash?.resent) {
      setMessage(
        "A fresh verification link has been sent to your email address.",
      );
      setIsSuccess(true);
    }
  }, [flash]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage(null);

    try {
      const response = await axios.post("/email/verification-notification");
      setMessage(
        "A fresh verification link has been sent to your email address.",
      );
      setIsSuccess(true);
      toast.success("Verification email sent!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to send verification email.";
      setMessage(errorMessage);
      setIsSuccess(false);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/logout";

    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
      const csrfInput = document.createElement("input");
      csrfInput.type = "hidden";
      csrfInput.name = "_token";
      csrfInput.value = csrfToken.getAttribute("content") || "";
      form.appendChild(csrfInput);
    }

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <>
      <style>{`
        @keyframes move-bg-diagonal {
          0% { transform: rotate(45deg) scale(150%) translateX(0); }
          100% { transform: rotate(45deg) scale(150%) translateX(15%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <App title="Email Verification" auth={auth}>
        {/* Full Screen Animated Background - Same as Home page */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ animation: "move-bg-diagonal 10s linear infinite" }}
          >
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.15)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          </div>
        </div>

        {/* Email Verification Overlay - Positioned like HeroScreen */}
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* Account for header (h-14 = 56px) and footer (~60px) */}
          <div className="absolute top-14 bottom-16 left-0 right-0 pointer-events-auto flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              {/* Main Verification Card */}
              <Card className="backdrop-blur-lg bg-white/10 border-white/20 shadow-2xl">
                <CardHeader className="text-center pb-2">
                  <div
                    className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    style={{ animation: "float 3s ease-in-out infinite" }}
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Verify Your Email
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Check your email for a verification link
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Status Message */}
                  {message && (
                    <Alert
                      className={`${
                        isSuccess
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {isSuccess ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  {/* Instructions */}
                  <div className="text-center space-y-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      We've sent a verification link to{" "}
                      <strong className="text-gray-900">
                        {auth.user?.email}
                      </strong>
                    </p>
                    <p className="text-gray-500 text-sm">
                      Click the link in the email to activate your account and
                      start playing!
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleResendEmail}
                      disabled={isResending}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Verification Email
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>

                  {/* Help Text */}
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">
                      Didn't receive the email? Check your spam folder or click
                      "Resend" above.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center mt-6">
                <p className="text-gray-400 text-xs">
                  Need help? Contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </App>
    </>
  );
}
