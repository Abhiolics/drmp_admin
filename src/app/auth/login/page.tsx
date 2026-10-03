'use client';

import React, { useState } from 'react';
import { useAuth, ADMIN_AUTHORIZED_EMAIL } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Mail, KeyRound, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { sendOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('abhisheksingh03674@gmail.com');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Please enter administrator email');
      return;
    }
    if (cleanEmail !== ADMIN_AUTHORIZED_EMAIL) {
      toast.error(`Access denied. Administrator access is restricted strictly to ${ADMIN_AUTHORIZED_EMAIL}`);
      return;
    }
    setIsLoading(true);
    try {
      await sendOtp(cleanEmail);
      setStep('otp');
    } catch {
      // toast notification is already shown in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!otp) return;
    if (cleanEmail !== ADMIN_AUTHORIZED_EMAIL) {
      toast.error(`Access denied. Administrator access is restricted strictly to ${ADMIN_AUTHORIZED_EMAIL}`);
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtp(cleanEmail, otp);
    } catch {
      // toast notification is already shown in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />

      <Card className="w-full max-w-md border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Dreampay Admin Portal</CardTitle>
          <CardDescription className="text-slate-400">
            {step === 'email' 
              ? 'Secure OTP authentication for designated administrator' 
              : `Verification code sent to ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-slate-300">Authorized Admin Email</Label>
                  <span className="text-[11px] text-indigo-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Strict Access
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-8 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="abhisheksingh03674@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-14 border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Access restricted strictly to: <span className="text-slate-300 font-mono">abhisheksingh03674@gmail.com</span>
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !email} 
                className="w-full h-14 bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium text-sm cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Admin OTP...
                  </>
                ) : (
                  'Send One-Time Password'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-300">OTP Code</Label>
                <div className="relative">
                  <KeyRound className="absolute  h-8 left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoFocus
                    className="pl-10 h-14 border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 tracking-widest focus-visible:ring-indigo-500 font-mono text-center text-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('email')}
                  className="flex-1 h-14 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white cursor-pointer"
                >
                  Change Email
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || otp.length < 4}
                  className="flex-1 h-14 bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Enter'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
