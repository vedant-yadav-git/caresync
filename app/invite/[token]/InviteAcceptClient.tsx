'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Mail, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface InviteAcceptClientProps {
  invite: {
    id: string;
    token: string;
    email: string;
    role: string;
    householdName: string;
    invitedBy: string;
  };
  isLoggedIn: boolean;
  currentUserEmail?: string | null;
}

export function InviteAcceptClient({
  invite,
  isLoggedIn,
  currentUserEmail,
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'choice' | 'signup' | 'login'>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Signup form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState(invite.email);
  const [password, setPassword] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState(invite.email);
  const [loginPassword, setLoginPassword] = useState('');

  const handleAcceptLoggedIn = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: invite.token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to accept invite');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, create the account
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          // Don't create a new household - we'll join the invited one
          skipHousehold: true,
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        throw new Error(signupData.error || 'Failed to create account');
      }

      // Then accept the invite
      const acceptRes = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: invite.token }),
      });

      const acceptData = await acceptRes.json();

      if (!acceptRes.ok) {
        throw new Error(acceptData.error || 'Failed to accept invite');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, log in
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.error || 'Failed to log in');
      }

      // Then accept the invite
      const acceptRes = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: invite.token }),
      });

      const acceptData = await acceptRes.json();

      if (!acceptRes.ok) {
        throw new Error(acceptData.error || 'Failed to accept invite');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, show simple accept button
  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sage-50 p-4">
        <div className="card p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-slate-800 mb-2">
              You're Invited!
            </h1>
            <p className="text-slate-500">
              <strong>{invite.invitedBy}</strong> invited you to join
            </p>
            <p className="text-xl font-display font-semibold text-brand-600 mt-1">
              {invite.householdName}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleAcceptLoggedIn}
            loading={loading}
            className="w-full"
          >
            Join Household
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-center text-sm text-slate-500 mt-4">
            Logged in as {currentUserEmail}
          </p>
        </div>
      </div>
    );
  }

  // Not logged in - show options
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sage-50 p-4">
      <div className="card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-800 mb-2">
            You're Invited!
          </h1>
          <p className="text-slate-500">
            <strong>{invite.invitedBy}</strong> invited you to join
          </p>
          <p className="text-xl font-display font-semibold text-brand-600 mt-1">
            {invite.householdName}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {mode === 'choice' && (
          <div className="space-y-3">
            <Button onClick={() => setMode('signup')} className="w-full">
              Create Account
            </Button>
            <Button
              onClick={() => setMode('login')}
              variant="secondary"
              className="w-full"
            >
              I Already Have an Account
            </Button>
          </div>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Create Account & Join
            </Button>
            <button
              type="button"
              onClick={() => setMode('choice')}
              className="w-full text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back
            </button>
          </form>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Your password"
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Log In & Join
            </Button>
            <button
              type="button"
              onClick={() => setMode('choice')}
              className="w-full text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
