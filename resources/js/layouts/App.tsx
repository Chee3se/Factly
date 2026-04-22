import React, { PropsWithChildren, useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Trophy, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import LobbyInvitationModal from "@/components/Lobby/LobbyInvitationModal";
import { useFriends } from "@/hooks/useFriends";

const appName = import.meta.env.VITE_APP_NAME || "Factly";

interface Props {
  title: string;
  auth: Auth;
}

export default function App({
  title,
  auth,
  children,
}: PropsWithChildren<Props>) {
  const [loading, setLoading] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const page = usePage();
  const isInGame = /^\/games\/[^/]+/.test(page.url);

  const friendsHook = useFriends(auth.user?.id);

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = (avatar?: string): string | undefined => {
    if (!avatar) return undefined;
    return `/storage/${avatar}`;
  };

  const handleAcceptLobbyInvite = async (lobbyCode: string) => {
    if (!auth.user) return;
    setLoading(true);
    try {
      await friendsHook.acceptLobbyInvitation(lobbyCode);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineLobbyInvite = () => {
    if (!auth.user) return;
    friendsHook.declineLobbyInvitation();
  };

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {isInGame ? (
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(true)}
                  className="flex items-center space-x-2 cursor-pointer group"
                  title="Exit game"
                >
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center group-hover:opacity-80 transition-opacity">
                    <img src={"/factly-logo-v2-white.png"} className="h-6" />
                  </div>
                  <span className="font-extrabold text-lg italic">{appName}</span>
                </button>
              ) : (
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                    <img src={"/factly-logo-v2-white.png"} className="h-6" />
                  </div>
                  <span className="font-extrabold text-lg italic">{appName}</span>
                </Link>
              )}

              <div className="flex items-center space-x-4">
                {isInGame && (
                  <Button
                    variant="outline"
                    onClick={() => setShowExitConfirm(true)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Exit Game
                  </Button>
                )}
                <Button asChild variant="ghost">
                  <Link
                    href="/leaderboards"
                    className="flex items-center gap-2"
                  >
                    <Trophy className="h-4 w-4" />
                    Leaderboards
                  </Link>
                </Button>

                {auth.user?.role == "admin" && (
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/admin/dashboard")}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {auth.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full"
                      >
                        <Avatar
                          className="h-10 w-10"
                          decoration={auth.user.decoration}
                        >
                          <AvatarImage
                            src={getAvatarUrl(auth.user.avatar)}
                            alt={auth.user.name}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {auth.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium text-sm">
                            {auth.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {auth.user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/logout"
                          method="post"
                          as="button"
                          className="flex items-center w-full text-red-600 focus:text-red-600"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button asChild>
                      <Link href="/login">Sign up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <Toaster richColors />

        {/* Global Lobby Invitation Modal - only show for authenticated users */}
        {auth.user && (
          <LobbyInvitationModal
            lobbyInvitation={friendsHook.lobbyInvitation}
            onAccept={handleAcceptLobbyInvite}
            onDecline={handleDeclineLobbyInvite}
            loading={loading}
          />
        )}

        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exit game?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current progress will be lost. Your best score stays saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep playing</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowExitConfirm(false);
                  window.location.href = "/";
                }}
              >
                Exit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <img src={"/factly-logo-v2-white.png"} className="h-6" />
                </div>
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
