import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { User, Home, Bell, Shield } from 'lucide-react';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) redirect('/login');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-800">
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Account Settings */}
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-400" />
            Account
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-slate-500">Name</label>
            <p className="font-medium text-slate-800">{user.name || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm text-slate-500">Email</label>
            <p className="font-medium text-slate-800">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-slate-500">Member since</label>
            <p className="font-medium text-slate-800">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications Settings - Placeholder */}
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-400" />
            Notifications
          </h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-500">
            Email notification settings coming soon.
          </p>
        </div>
      </div>

      {/* Privacy Settings - Placeholder */}
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" />
            Privacy & Security
          </h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-500">
            Password and security settings coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
