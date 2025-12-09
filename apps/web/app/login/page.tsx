'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    await authClient.signIn.email({
        email,
        password,
    }, {
        onSuccess: () => {
             router.push('/chat');
        },
        onError: (ctx) => {
             alert(ctx.error.message);
             setLoading(false);
        }
    });
  };

  const handleSignUp = async () => {
    setLoading(true);
    await authClient.signUp.email({
        email,
        password,
        name: 'New User', // Default name
    }, {
        onSuccess: () => {
             router.push('/chat');
        },
        onError: (ctx) => {
             alert(ctx.error.message);
             setLoading(false);
        }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Login or create an account to start chatting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              className="bg-slate-800 border-slate-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              className="bg-slate-800 border-slate-700 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSignIn} disabled={loading}>
            {loading ? 'Processing...' : 'Sign In'}
          </Button>
           <Button variant="ghost" className="w-full text-slate-400 hover:text-white" onClick={handleSignUp} disabled={loading}>
            Create an account
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
