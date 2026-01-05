'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Mail,
  Crown,
  UserMinus,
  Copy,
  Check,
  Plus,
  Clock,
} from 'lucide-react';
import { Button, Input, Modal, Avatar, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/dates';
import type { Household, HouseholdMember, Invite, MemberRole, UserSummary } from '@/types';

interface HouseholdPageClientProps {
  household: Household & {
    members: (HouseholdMember & { user: UserSummary })[];
    invites: Invite[];
  };
  currentUserId: string;
  currentUserRole: MemberRole;
}

export function HouseholdPageClient({
  household,
  currentUserId,
  currentUserRole,
}: HouseholdPageClientProps) {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = currentUserRole === 'OWNER';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteLoading(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdId: household.id,
          email: inviteEmail,
        }),
      });

      if (!res.ok) throw new Error('Failed to send invite');

      setInviteEmail('');
      setShowInviteModal(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await fetch(`/api/household/members/${memberId}`, {
        method: 'DELETE',
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const copyInviteLink = async (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-800">
            {household.name}
          </h1>
          <p className="text-slate-500 mt-1">
            {household.members.length} member{household.members.length !== 1 && 's'}
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setShowInviteModal(true)}>
            <Plus className="w-4 h-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Members List */}
      <div className="card">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            Members
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {household.members.map((member) => (
            <div
              key={member.id}
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  name={member.user.name}
                  size="md"
                  id={member.user.id}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-800">
                      {member.user.name || member.user.email}
                    </p>
                    {member.role === 'OWNER' && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                    {member.userId === currentUserId && (
                      <Badge variant="default">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={member.role === 'OWNER' ? 'medium' : 'default'}
                >
                  {member.role}
                </Badge>
                {isOwner &&
                  member.userId !== currentUserId &&
                  member.role !== 'OWNER' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <UserMinus className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invites */}
      {isOwner && household.invites.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-display font-semibold text-slate-800 flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-400" />
              Pending Invites
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {household.invites.map((invite) => (
              <div
                key={invite.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800">{invite.email}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Sent {formatTimeAgo(invite.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInviteLink(invite.token)}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy Link
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Member"
        description="Send an invitation to join your household"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            type="email"
            label="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="family@example.com"
            required
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={inviteLoading} className="flex-1">
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
