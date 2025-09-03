import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Login from '../components/Login';
import Register from '../components/Register';
import space from '../../images/space_background.png'
import character from '../../images/cartoon_figure.png'
import blue_portal from '../../images/portal_blue.png'
import orange_portal from '../../images/portal_orange.png'

const appName = import.meta.env.VITE_APP_NAME || 'Factly';

interface Props {
    canResetPassword?: boolean;
    status?: string;
}

export default function Auth({ canResetPassword, status }: Props) {

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex items-center justify-center bg-background p-8 lg:p-12">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-xl">F</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold">Welcome to {appName}</h1>
                        <p className="text-muted-foreground">Sign in to your account or create a new one</p>
                    </div>

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login" className="transition-all duration-300">Sign In</TabsTrigger>
                            <TabsTrigger value="register" className="transition-all duration-300">Sign Up</TabsTrigger>
                        </TabsList>

                        <div className="relative mt-6 min-h-[400px]">
                            <TabsContent
                                value="login"
                                className="absolute inset-0 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0 data-[state=inactive]:zoom-out-95 data-[state=active]:zoom-in-95 data-[state=inactive]:slide-out-to-left-1/2 data-[state=active]:slide-in-from-right-1/2 duration-300"
                            >
                                <Login
                                    canResetPassword={canResetPassword}
                                    status={status}
                                    compact={true}
                                />
                            </TabsContent>

                            <TabsContent
                                value="register"
                                className="absolute inset-0 data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0 data-[state=inactive]:zoom-out-95 data-[state=active]:zoom-in-95 data-[state=inactive]:slide-out-to-right-1/2 data-[state=active]:slide-in-from-left-1/2 duration-300"
                            >
                                <Register compact={true} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out"
                    style={{ backgroundImage: `url(${space})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />

                    <div className="absolute top-10 left-1/2 -translate-x-1/2">
                        <img
                            src={orange_portal}
                            alt="Orange Portal"
                            className="w-32 h-16"
                        />
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                        <img
                            src={blue_portal}
                            alt="Blue Portal"
                            className="w-32 h-16"
                        />
                    </div>

                    <div className="absolute top-20 left-7/12">
                        <img
                            src={character}
                            alt="Character"
                            className="w-24 h-24 -translate-x-1/2 animate-spin-fall"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
