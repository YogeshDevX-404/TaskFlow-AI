import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  role: z.enum(['admin', 'member', 'guest']).default('member'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member', 'guest']),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required').trim(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
