'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';
import { ChevronLeft, KeyRound, Mail, Sparkles, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true);
    try {
        if (isLogin) {
            await authClient.signIn.email({
                email,
                password,
            }, {
                onSuccess: () => router.push('/chat'),
                onError: (ctx) => alert(ctx.error.message)
            });
        } else {
            await authClient.signUp.email({
                email,
                password,
                name: name || 'New User',
            }, {
                onSuccess: () => router.push('/chat'),
                onError: (ctx) => alert(ctx.error.message)
            });
        }
    } catch (e) {
        console.error(e);
        alert("Something went wrong");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50/50 relative overflow-hidden p-4">
       {/* Background Decoration */}
       <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-blue-200/30 blur-[120px]" />
       <div className="absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-cyan-200/30 blur-[120px]" />

      <Card className="z-10 w-full max-w-md border-white/60 bg-white/60 backdrop-blur-xl shadow-2xl transition-all duration-300">
        <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Sparkles className="h-6 w-6" />
            </div>
          <CardTitle className="text-2xl font-bold text-blue-900">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-blue-600/70">
            {isLogin ? 'Enter the room again' : 'Start your journey simply'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            
          {!isLogin && (
            <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-800">Your Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                    <Input 
                    id="name" 
                    placeholder="Nickname" 
                    className="pl-10 bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-800">Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input 
                id="email" 
                type="email" 
                placeholder="hello@sala.ai" 
                className="pl-10 bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-800">Password</Label>
            <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10 bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-blue-400 hover:text-blue-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-200/50 transition-all hover:scale-[1.02]" 
            onClick={handleAuth} 
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Enter' : 'Join')}
          </Button>

          <div className="flex items-center gap-2 text-sm text-blue-600/80">
            {isLogin ? "Don't have a key?" : "Already have a key?"}
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold underline underline-offset-2 hover:text-blue-800"
            >
                {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
          
          <Link href="/" className="mt-2 text-xs text-blue-400 hover:text-blue-600 flex items-center gap-1">
             <ChevronLeft className="h-3 w-3" /> Back to Entrance
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
