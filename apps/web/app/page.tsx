
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 p-4 text-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <main className="z-10 flex max-w-3xl flex-col items-center text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
          Sala 3D <span className="text-indigo-400">Gemini</span>
        </h1>
        <p className="mb-8 text-lg text-slate-300 sm:text-xl">
          Experience the next generation of AI companionship with full 3D presence.
          Engage in meaningful conversations with a personality that evolves with you.
        </p>

        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Get Started
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="border-indigo-400 text-indigo-100 hover:bg-indigo-900/50 hover:text-white">
              Learn More
            </Button>
          </Link>
        </div>
        
        {/* Placeholder for 3D Preview (Image or Video could go here) */}
        <div className="mt-12 h-64 w-full max-w-lg rounded-lg border border-indigo-500/30 bg-indigo-950/50 shadow-2xl backdrop-blur-sm lg:h-96">
            <div className="flex h-full items-center justify-center text-indigo-400/50">
                3D Preview Component
            </div>
        </div>
      </main>

      <footer className="z-10 mt-20 text-sm text-slate-500">
        © 2025 Sala 3D Project. Powered by Gemini & Unity.
      </footer>
    </div>
  );
}
