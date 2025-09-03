import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import google from '../../images/google.svg'

const appName = import.meta.env.VITE_APP_NAME || 'Factly';

interface LoginData {
    email: string;
    password: string;
    remember: boolean;
}

interface Props {
    canResetPassword?: boolean;
    status?: string;
    compact?: boolean;
}

export default function Login({ canResetPassword, status, compact = false }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LoginData>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className={compact ? "w-full" : "min-h-screen flex items-center justify-center bg-background p-4"}>
            <div className={compact ? "w-full" : "w-full max-w-md space-y-6"}>
                {!compact && (
                    <>
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="flex justify-center">
                                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-xl">F</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold">Welcome back</h1>
                            <p className="text-muted-foreground">Sign in to your {appName} account</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <Alert>
                                <AlertDescription>{status}</AlertDescription>
                            </Alert>
                        )}
                    </>
                )}

                {compact && status && (
                    <Alert className="mb-4">
                        <AlertDescription>{status}</AlertDescription>
                    </Alert>
                )}

                {/* Login Form */}
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Sign in</CardTitle>
                        {!compact && (
                            <CardDescription>
                                Enter your email and password to access your account
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="remember" className="text-sm">
                                        Remember me
                                    </Label>
                                </div>

                                {canResetPassword && (
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <a
                            href={route('auth.google.redirect')}
                            className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            <img src={google} alt="Google" className="w-5 h-5 mr-2" />
                            Sign in with Google
                        </a>
                    </CardContent>
                    {!compact && (
                        <CardFooter>
                            <p className="text-center text-sm text-muted-foreground w-full">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-primary hover:underline font-medium">
                                    Sign up
                                </Link>
                            </p>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}
