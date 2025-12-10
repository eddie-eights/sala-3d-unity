'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authClient } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';
import { ChevronLeft, KeyRound, Mail, Sparkles, User, Eye, EyeOff, Fingerprint } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.signIn.email({
        email,
        password,
    }, {
        onSuccess: () => router.push('/chat'),
        onError: (ctx: any) => {
            alert(ctx.error.message);
            setLoading(false);
        }
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0] || "User", // Default name
    }, {
        onSuccess: () => router.push('/mypage'),
        onError: (ctx: any) => {
            alert(ctx.error.message);
            setLoading(false);
        }
    });
  };

  const handleGoogleSignIn = async () => {
      await authClient.signIn.social({ 
          provider: 'google',
          callbackURL: '/mypage'
      });
  };

  const handlePasskeySignIn = async () => {
    // try {
    //     await authClient.signIn.passkey({
    //         callbackURL: "/mypage",
    //     });
    // } catch (e: any) {
    //     alert(e.message || "Failed to sign in with Passkey");
    // }
    alert("Passkey login is temporarily disabled due to library maintenance.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50/50 relative overflow-hidden p-4">
       {/* Background Decoration */}
       <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-blue-200/30 blur-[120px]" />
       <div className="absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-cyan-200/30 blur-[120px]" />

      <Card className="z-10 w-full max-w-md border-white/60 bg-white/60 backdrop-blur-xl shadow-2xl transition-all duration-300">
        <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Sparkles className="h-6 w-6" />
            </div>
          <CardTitle className="text-2xl font-bold text-blue-900">
            Welcome to Sala
          </CardTitle>
          <CardDescription className="text-blue-600/70">
            Your personal 3D space
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-blue-100/50">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                    <form onSubmit={handleSignIn} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-login" className="text-blue-800">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                                <Input 
                                id="email-login" 
                                type="email" 
                                placeholder="hello@sala.ai" 
                                className="pl-10 bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password-login" className="text-blue-800">Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                                <Input 
                                id="password-login" 
                                type={showPassword ? "text" : "password"}
                                className="pl-10 pr-10 bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-blue-400 hover:text-blue-600 focus:outline-none">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>
                </TabsContent>
                
                <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-signup" className="text-blue-800">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                                <Input 
                                id="email-signup" 
                                type="email" 
                                placeholder="new@sala.ai" 
                                className="pl-10 bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password-signup" className="text-blue-800">Password</Label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                                <Input 
                                id="password-signup" 
                                type={showPassword ? "text" : "password"}
                                className="pl-10 pr-10 bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-blue-400 hover:text-blue-600 focus:outline-none">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {/* Password Requirements */}
                            <div className="text-xs space-y-1 pt-1">
                                <p className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {password.length >= 8 ? '✓' : '○'} 8文字以上
                                </p>
                            </div>
                        </div>
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={loading || password.length < 8}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-blue-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-blue-400 backdrop-blur-sm">Or continue with</span>
                </div>
            </div>

{/* Passkey Login Temporarily Disabled due to lib issue */}
            {/* <Button 
                variant="outline" 
                className="w-full border-blue-200 hover:bg-blue-50 text-blue-700 mb-2"
                onClick={handlePasskeySignIn}
            >
                <Fingerprint className="mr-2 h-4 w-4" />
                Sign in with Passkey
            </Button> */}

            <Button 
                variant="outline" 
                className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
                onClick={handleGoogleSignIn}
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C.77 9.84 0 12 0 14.61c0 2.61.77 4.77 2.18 7.56l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
            </Button>

        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" className="text-xs text-blue-400 hover:text-blue-600 flex items-center gap-1">
             <ChevronLeft className="h-3 w-3" /> Back to Entrance
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
