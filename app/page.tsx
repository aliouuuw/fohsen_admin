"use client"

import { useAuth } from "@/lib/authism";
import { SigninForm } from "@/lib/authism/client/components/signin-form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex h-screen">
      {/* Left side - Branding and Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-black/20" /> {/* Overlay for better text readability */}
        <div className="z-10 text-center space-y-6">
          <div className="flex justify-center">
            <Image src="/keursante_logo.png" alt="Fohsen Logo" width={100} height={100} />
          </div>
          <h1 className="text-4xl font-bold mb-4">Fohsen LMS Platform</h1>
          <p className="text-xl opacity-90 max-w-md">
            Manage your learning content, students, and courses all in one place
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Course Management</h3>
              <p className="text-sm opacity-80">Create and manage your courses with ease</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Student Tracking</h3>
              <p className="text-sm opacity-80">Monitor student progress and performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your admin dashboard
            </p>
          </div>
          <SigninForm />
        </div>
      </div>
    </div>
  );
}
