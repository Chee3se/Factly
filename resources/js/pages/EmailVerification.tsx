import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import App from "@/layouts/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, LogOut } from "lucide-react";
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
    if (flash?.resent) {
      setMessage("A fresh verification link has been sent to your email.");
      setIsSuccess(true);
    }
  }, [flash]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage(null);

    try {
      await axios.post("/email/verification-notification");
      setMessage("A fresh verification link has been sent to your email.");
      setIsSuccess(true);
      toast.success("Verification email sent");
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

  return (
    <App title="Email Verification" auth={auth}>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] px-4">
        <Card className="w-full max-w-md border-border/60 bg-background/80 backdrop-blur shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                Verify your email
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a link to{" "}
                <span className="font-medium text-foreground">
                  {auth.user?.email}
                </span>
                . Click it to finish setting up your account.
              </p>
            </div>

            {message && (
              <div
                className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                  isSuccess
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-destructive/30 bg-destructive/5 text-destructive"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/logout" method="post" as="button">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Didn't get it? Check your spam folder, or hit resend.
            </p>
          </CardContent>
        </Card>
      </div>
    </App>
  );
}
