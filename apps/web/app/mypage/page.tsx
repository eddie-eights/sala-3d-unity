'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";
import { ArrowLeft, Loader2, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function MyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: "",
        birthday: "", // Date string YYYY-MM-DD
        gender: "",
        hometown: "",
        currentResidence: "",
        hobbies: "",
        name: "", // Display purpose
    });

    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");

    // --- Date Logic ---
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const daysInMonth = (year: string, month: string) => {
        if (!year || !month) return 31;
        return new Date(parseInt(year), parseInt(month), 0).getDate();
    };
    const days = Array.from({ length: daysInMonth(birthYear, birthMonth) }, (_, i) => i + 1);

    useEffect(() => {
        if (birthYear && birthMonth && birthDay) {
            setFormData(prev => ({
                ...prev,
                birthday: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
            }));
        }
    }, [birthYear, birthMonth, birthDay]);


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setFormData(prev => ({ ...prev, ...data }));
                        if (data.birthday) {
                            const [y, m, d] = data.birthday.split('-');
                            setBirthYear(y);
                            setBirthMonth(parseInt(m).toString());
                            setBirthDay(parseInt(d).toString());
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to fetch profile", e);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        if (!formData.username || !formData.birthday) {
            setError("Username and Birthday are required.");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.error || "Failed to update profile");
            }
            
            // Success feedback
            toast.success("Profile updated! Let's chat!", {
                description: "Redirecting to your room...",
                duration: 2000,
            });

            // Redirect to chat
            setTimeout(() => {
                router.push('/chat');
            }, 1000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Logged out successfully");
                    router.push("/login");
                },
            },
        });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-blue-50 text-blue-600">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-blue-50/50 relative overflow-hidden flex items-center justify-center p-4">
         {/* Background Decoration */}
         <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-blue-200/30 blur-[120px] pointer-events-none" />
         <div className="absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-cyan-200/30 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-2xl space-y-6 pt-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/chat">
                        <Button variant="ghost" size="icon" className="hover:bg-white/50 text-blue-900 rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <User className="h-4 w-4" />
                        </div>
                        <h1 className="text-2xl font-bold text-blue-900">My Page</h1>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout}
                    className="hover:bg-red-50 text-red-500 rounded-full hover:text-red-600 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border-white/60 bg-white/60 backdrop-blur-xl shadow-xl transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-blue-900">Personal Details</CardTitle>
                        <CardDescription className="text-blue-500/80">Customize your identity in Sala. Username and Birthday are required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-blue-800 font-medium">Username <span className="text-red-400">*</span></Label>
                                <Input 
                                    id="username" 
                                    placeholder="unique_username" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 text-blue-900 placeholder:text-blue-300/70" 
                                    required
                                />
                                <p className="text-xs text-blue-400/70">How others will see you.</p>
                            </div>

                             <div className="space-y-2 col-span-1 sm:col-span-2">
                                <Label className="text-blue-800 font-medium">Date of Birth <span className="text-red-400">*</span></Label>
                                <div className="flex gap-2">
                                    {/* Year */}
                                    <div className="relative w-full">
                                        <select
                                            id="dob-year"
                                            className="flex h-10 w-full appearance-none rounded-md border border-blue-100 bg-white/80 px-3 py-2 text-sm text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.birthday ? new Date(formData.birthday).getFullYear() : ""}
                                            onChange={(e) => {
                                                const y = e.target.value;
                                                const d = formData.birthday ? new Date(formData.birthday) : new Date();
                                                const m = formData.birthday ? d.getMonth() + 1 : 1;
                                                const day = formData.birthday ? d.getDate() : 1;
                                                if (y) setFormData(prev => ({ ...prev, birthday: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` }));
                                            }}
                                            required
                                        >
                                            <option value="" disabled>Year</option>
                                            {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Month */}
                                    <div className="relative w-full">
                                        <select
                                            id="dob-month"
                                            className="flex h-10 w-full appearance-none rounded-md border border-blue-100 bg-white/80 px-3 py-2 text-sm text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.birthday ? new Date(formData.birthday).getMonth() + 1 : ""}
                                            onChange={(e) => {
                                                const m = e.target.value;
                                                const d = formData.birthday ? new Date(formData.birthday) : new Date();
                                                const y = formData.birthday ? d.getFullYear() : 2000;
                                                const day = formData.birthday ? d.getDate() : 1;
                                                if (m) setFormData(prev => ({ ...prev, birthday: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` }));
                                            }}
                                            required
                                        >
                                            <option value="" disabled>Month</option>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Day */}
                                    <div className="relative w-full">
                                        <select
                                            id="dob-day"
                                            className="flex h-10 w-full appearance-none rounded-md border border-blue-100 bg-white/80 px-3 py-2 text-sm text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.birthday ? new Date(formData.birthday).getDate() : ""}
                                            onChange={(e) => {
                                                const day = e.target.value;
                                                const d = formData.birthday ? new Date(formData.birthday) : new Date();
                                                const y = formData.birthday ? d.getFullYear() : 2000;
                                                const m = formData.birthday ? d.getMonth() + 1 : 1;
                                                if (day) setFormData(prev => ({ ...prev, birthday: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` }));
                                            }}
                                            required
                                        >
                                            <option value="" disabled>Day</option>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 col-span-1 sm:col-span-2">
                                <Label className="text-blue-800 font-medium">Gender</Label>
                                <div className="relative w-full">
                                    <select
                                        id="gender"
                                        className="flex h-10 w-full appearance-none rounded-md border border-blue-100 bg-white/80 px-3 py-2 text-sm text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.gender}
                                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                    >
                                        <option value="" disabled>Select Gender</option>
                                        <option value="male">男性</option>
                                        <option value="female">女性</option>
                                        <option value="no_answer">無回答</option>
                                    </select>
                                </div>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="hometown" className="text-blue-800 font-medium">Hometown</Label>
                                <Input 
                                    id="hometown" 
                                    placeholder="Tokyo, Japan" 
                                    value={formData.hometown}
                                    onChange={handleChange}
                                    className="bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 text-blue-900 placeholder:text-blue-300/70" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currentResidence" className="text-blue-800 font-medium">Current Residence</Label>
                                <Input 
                                    id="currentResidence" 
                                    placeholder="New York, USA" 
                                    value={formData.currentResidence}
                                    onChange={handleChange}
                                    className="bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 text-blue-900 placeholder:text-blue-300/70" 
                                />
                            </div>
                             <div className="space-y-2 col-span-1 sm:col-span-2">
                                <Label htmlFor="hobbies" className="text-blue-800 font-medium">Hobbies</Label>
                                <Input 
                                    id="hobbies" 
                                    placeholder="Reading, Coding, etc." 
                                    value={formData.hobbies}
                                    onChange={handleChange}
                                    className="bg-white/80 border-blue-100 focus:border-blue-400 focus:ring-blue-400/20 text-blue-900 placeholder:text-blue-300/70" 
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">{error}</p>}
                        
                        <div className="pt-4">
                            <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-200/50 transition-all hover:scale-[1.02] font-semibold h-11">
                                {saving ? "Saving Changes..." : "Save Profile"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    </div>
  )
}
