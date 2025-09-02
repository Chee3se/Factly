import React, { PropsWithChildren } from 'react';
import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';

const appName = import.meta.env.VITE_APP_NAME || 'Factly';

interface Auth {
    user?: {
        name: string;
        email: string;
    };
}

interface Props {
    title: string;
    auth: Auth;
}

export default function App({ title, auth, children }: PropsWithChildren<Props>) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-background flex flex-col">
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-14">
                            <Link href="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-sm">F</span>
                                </div>
                                <span className="font-semibold text-lg">{appName}</span>
                            </Link>

                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {auth.user.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56" align="end" forceMount>
                                            <div className="flex items-center justify-start gap-2 p-2">
                                                <div className="flex flex-col space-y-1 leading-none">
                                                    <p className="font-medium text-sm">{auth.user.name}</p>
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
                                            <DropdownMenuItem asChild>
                                                <Link href="/settings" className="flex items-center">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Settings
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
                                        <Button variant="ghost" asChild>
                                            <Link href="/login">Login</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href="/register">Sign Up</Link>
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

                <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-xs">F</span>
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
