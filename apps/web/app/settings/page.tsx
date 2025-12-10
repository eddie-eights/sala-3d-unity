'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: "",
        birthday: "",
        gender: "",
        hometown: "",
        currentResidence: "",
        hobbies: "",
        name: "", // Display purpose
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                if (!res.ok) throw new Error("Failed to load profile");
                const data = await res.json();
                
                // Format date for input type="date"
                let formattedDob = "";
                if (data.birthday) {
                    formattedDob = new Date(data.birthday).toISOString().split('T')[0];
                }

                setFormData({
                    username: data.username || "",
                    birthday: formattedDob,
                    gender: data.gender || "",
                    hometown: data.hometown || "",
                    currentResidence: data.currentResidence || "",
                    hobbies: data.hobbies || "",
                    name: data.name || "",
                });
            } catch (e: any) {
                console.error(e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

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
            
            // Success feedback?
            alert("Profile updated successfully!");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/chat">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="border-slate-800 bg-slate-900 text-slate-100">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal details. Username and Birthday are required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="username" 
                                    placeholder="unique_username" 
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="bg-slate-800 border-slate-700" 
                                    required
                                />
                                <p className="text-xs text-slate-400">Unique identifier.</p>
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="birthday">Date of Birth <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="birthday" 
                                    type="date" 
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    className="bg-slate-800 border-slate-700" 
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Input 
                                    id="gender" 
                                    placeholder="e.g. Male, Female, Other" 
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="bg-slate-800 border-slate-700" 
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="hometown">Hometown</Label>
                                <Input 
                                    id="hometown" 
                                    placeholder="Tokyo, Japan" 
                                    value={formData.hometown}
                                    onChange={handleChange}
                                    className="bg-slate-800 border-slate-700" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currentResidence">Current Residence</Label>
                                <Input 
                                    id="currentResidence" 
                                    placeholder="New York, USA" 
                                    value={formData.currentResidence}
                                    onChange={handleChange}
                                    className="bg-slate-800 border-slate-700" 
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="hobbies">Hobbies</Label>
                                <Input 
                                    id="hobbies" 
                                    placeholder="Reading, Coding, etc." 
                                    value={formData.hobbies}
                                    onChange={handleChange}
                                    className="bg-slate-800 border-slate-700" 
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Profile"}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    </div>
  )
}
