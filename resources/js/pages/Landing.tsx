import React from "react";
import { Link, Head } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Gamepad2,
  Users,
  Sparkles,
  Trophy,
  ArrowRight,
  LogIn,
  UserPlus,
} from "lucide-react";

const appName = import.meta.env.VITE_APP_NAME || "Factly";

export default function Landing() {
  return (
    <>
      <Head title="Welcome" />
      <style>{`
        @keyframes move-bg-diagonal {
          0% { transform: rotate(45deg) scale(150%) translateX(0); }
          100% { transform: rotate(45deg) scale(150%) translateX(15%); }
        }
      `}</style>

      <div className="min-h-screen bg-background flex flex-col relative">
        {/* Animated diagonal grid background */}
        <div
          aria-hidden
          className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
        >
          <div
            className="absolute inset-0"
            style={{ animation: "move-bg-diagonal 10s linear infinite" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.12)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
          </div>
        </div>

        {/* Header */}
        <header className="relative z-20 border-b bg-background/80 backdrop-blur-md sticky top-0">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
            <div className="flex justify-between items-center h-14">
              <Link href="/" className="flex items-center">
                <img
                  src="/factly-logo-v3.png"
                  alt={appName}
                  className="h-8 w-auto"
                />
              </Link>

              <nav className="flex items-center gap-2 sm:gap-3">
                <Button
                  asChild
                  variant="ghost"
                  className="hidden sm:inline-flex"
                >
                  <Link href="/leaderboards" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Leaderboards
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/login" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Link>
                </Button>
              </nav>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1">
          {/* Hero */}
          <section className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16 py-28 md:py-40 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-background/80 backdrop-blur text-sm text-muted-foreground mb-12 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>Browser‑only · No install</span>
            </div>

            <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.1] mb-10">
              <span className="block mb-2">Party games</span>
              <span className="block">
                for{" "}
                <span className="italic bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pr-1">
                  friends.
                </span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-[1.7] mb-14">
              Quick trivia, weird auctions, and chaotic drawing prompts. Solo or
              with friends — just open a lobby and play.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="/login" className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Start playing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base bg-background/80 backdrop-blur"
              >
                <Link href="/leaderboards" className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  See leaderboards
                </Link>
              </Button>
            </div>
          </section>

          {/* Features */}
          <section className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <FeatureCard
                iconBg="bg-blue-100 dark:bg-blue-900/40"
                iconColor="text-blue-600 dark:text-blue-300"
                icon={<Users className="h-6 w-6" />}
                title="Play with friends"
                body="Spin up a lobby, share the code, battle it out in real‑time."
              />
              <FeatureCard
                iconBg="bg-purple-100 dark:bg-purple-900/40"
                iconColor="text-purple-600 dark:text-purple-300"
                icon={<Sparkles className="h-6 w-6" />}
                title="Unlock cosmetics"
                body="Hit score milestones to earn profile decorations. Show them off."
              />
              <FeatureCard
                iconBg="bg-amber-100 dark:bg-amber-900/40"
                iconColor="text-amber-600 dark:text-amber-300"
                icon={<Trophy className="h-6 w-6" />}
                title="Climb the ladder"
                body="Global leaderboards per game. Make your name stick."
              />
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative border-t bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16 py-24 md:py-32 text-center">
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.15] mb-8">
                Ready to play?
              </h2>
              <p className="text-lg text-muted-foreground leading-[1.7] max-w-xl mx-auto mb-12">
                Sign up in seconds. No downloads, no setup — just games.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link href="/login" className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Create an account
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-12 px-6 text-base"
                >
                  <Link href="/login">I already have one</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Toaster richColors />

        <footer className="relative z-10 border-t bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/factly-logo-v3.png"
                  alt={appName}
                  className="h-6 w-auto"
                />
                <span className="text-sm text-muted-foreground">
                  © 2025 {appName}. All rights reserved.
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
}

function FeatureCard({ icon, iconBg, iconColor, title, body }: FeatureCardProps) {
  return (
    <div className="p-8 md:p-10 rounded-2xl border border-border/60 bg-background/80 backdrop-blur shadow-sm">
      <div
        className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-6`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 leading-snug">{title}</h3>
      <p className="text-base text-muted-foreground leading-[1.7]">{body}</p>
    </div>
  );
}
