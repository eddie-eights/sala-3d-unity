
import Link from 'next/link';
import { DoorOpen } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-blue-50 relative overflow-hidden">
        {/* Ambient Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-100/60 blur-[100px]" />

        {/* Content Container */}
        <div className="relative z-10 flex h-full w-full max-w-7xl items-center justify-between px-8 md:px-16">
            
            {/* Left/Center: 3D Character Area */}
            {/* User requested Center, but layout typically works better if this takes substantial space. 
                Let's make it span most of the screen, with the button floating on the right. */}
            <div className="flex-1 flex items-center justify-center h-[80%]">
                {/* 3D Placeholder - Imagine the girl standing here */}
                <div className="relative flex h-full w-full max-w-lg items-center justify-center rounded-full bg-gradient-to-t from-blue-100/50 to-transparent">
                     {/* Temporary Silhouette or Text */}
                     <div className="text-center text-blue-900/20 font-bold text-6xl select-none animate-pulse">
                        3D MODEL HERE
                     </div>
                </div>
            </div>

            {/* Right: Door Login Button */}
            <div className="flex flex-col items-center justify-center ml-12">
                 <Link href="/login" className="group relative">
                    {/* Outline of a Door */}
                    <div className="relative h-[400px] w-[220px] rounded-t-full border-4 border-white/80 bg-white/30 backdrop-blur-sm shadow-xl transition-all duration-500 group-hover:bg-white/50 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden">
                        {/* Door Panel */}
                         <div className="absolute inset-2 rounded-t-full border-2 border-dashed border-white/50 flex flex-col items-center justify-center gap-4 group-hover:border-white">
                            <span className="text-2xl font-bold text-blue-800/80 tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                                ENTER
                            </span>
                            <DoorOpen className="h-12 w-12 text-blue-600/80 group-hover:text-blue-600 transition-colors" />
                         </div>
                         
                         {/* Shine effect */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]" />
                    </div>
                    
                    {/* Floor Shadow */}
                    <div className="mt-8 h-4 w-[200px] rounded-[100%] bg-blue-900/10 blur-md transition-all duration-500 group-hover:w-[240px] group-hover:bg-blue-900/20" />
                 </Link>
            </div>
        </div>

        {/* Footer / Copyright */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-blue-300">
            © 2025 Sala 3D Project
        </div>
    </div>
  );
}
