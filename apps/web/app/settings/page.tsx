'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
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

            <Card className="border-slate-800 bg-slate-900 text-slate-100">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details for better conversations.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input id="name" placeholder="Your Name" className="bg-slate-800 border-slate-700" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" className="bg-slate-800 border-slate-700" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="hometown">Hometown</Label>
                            <Input id="hometown" placeholder="Tokyo, Japan" className="bg-slate-800 border-slate-700" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="hobbies">Hobbies</Label>
                            <Input id="hobbies" placeholder="Reading, Coding, etc." className="bg-slate-800 border-slate-700" />
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="border-slate-800 bg-slate-900 text-slate-100">
                <CardHeader>
                    <CardTitle>Application Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                         <Label htmlFor="dark-mode">Dark Mode</Label>
                         <div className="text-sm text-slate-400">Always On</div>
                    </div>
                    <div className="flex items-center justify-between">
                         <Label htmlFor="notifications">Notifications</Label>
                         <div className="text-sm text-slate-400">Enabled</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
