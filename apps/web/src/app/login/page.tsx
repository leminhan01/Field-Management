'use client';

import { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

const features = [
  { icon: '📊', title: 'Dashboard overview', desc: 'Realtime statistics and performance charts' },
  { icon: '📋', title: 'Task Management', desc: 'Task, Template, Assign, Reports' },
  { icon: '👥', title: 'Staff Management', desc: 'Staff, roles, branches' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Vui long nhap email'); return; }
    if (!password) { setError('Vui long nhap mat khau'); return; }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-20 left-20 w-40 h-40 border border-white/20 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-40 right-20 w-60 h-60 border border-white/20 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-white/10 rounded-lg rotate-45" />
          <div className="absolute top-10 right-40 w-20 h-20 border border-white/15 rounded-lg rotate-12" />
        </div>

        {/* Logo */}
        <motion.div
          className="relative z-10 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #e8401c, #ff6b3d)', boxShadow: '0 4px 20px rgba(232,64,28,0.4)' }}
          >
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">Field Management</h1>
          <p className="text-gray-400 text-sm mt-2">Agency task management system</p>
        </motion.div>

        {/* Features */}
        <div className="relative z-10 space-y-5 w-full max-w-xs">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex items-center gap-3 text-gray-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{feature.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{feature.title}</p>
                <p className="text-xs text-gray-400">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.p
          className="relative z-10 mt-16 text-gray-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          &copy; 2026 FieldApp. All rights reserved.
        </motion.p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #e8401c, #ff6b3d)', boxShadow: '0 2px 12px rgba(232,64,28,0.35)' }}
            >
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Field Management</h1>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-7">Enter your account information to continue</p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-3 text-sm text-destructive">
                    {error}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            animate={error ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-[13px] text-muted-foreground cursor-pointer">
                  Ghi nho dang nhap
                </Label>
              </div>
              <a href="#" className="text-[13px] text-primary font-medium hover:underline">
                Quen mat khau?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-[14px] font-semibold shadow-md shadow-primary/25"
              size="lg"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </motion.div>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Sign in
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
