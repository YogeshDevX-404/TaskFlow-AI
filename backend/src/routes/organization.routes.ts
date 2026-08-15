import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { MemberController } from '../controllers/member.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { validateRequest } from '../validators/base.validator';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '../validators/organization.validator';
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/member.validator';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// Require authentication for all organization management operations
router.use(authenticateUser);

// Create Organization
router.post(
  '/',
  validateRequest(createOrganizationSchema),
  catchAsync(OrganizationController.create)
);

// Get My Organizations (with search, filter, pagination)
router.get('/', catchAsync(OrganizationController.getAll));

// Get Single Organization
router.get('/:id', catchAsync(OrganizationController.getById));

// Update Organization
router.put(
  '/:id',
  validateRequest(updateOrganizationSchema),
  catchAsync(OrganizationController.update)
);

// Archive Organization
router.patch('/:id/archive', catchAsync(OrganizationController.archive));

// Restore Organization
router.patch('/:id/restore', catchAsync(OrganizationController.restore));

// Delete Organization
router.delete('/:id', catchAsync(OrganizationController.delete));

/* ====================================================
   MEMBER & INVITATION MANAGEMENT ENDPOINTS
   ==================================================== */

// List members of organization
router.get('/:id/members', catchAsync(MemberController.getMembers));

// Invite new member by email
router.post(
  '/:id/invite',
  validateRequest(inviteMemberSchema),
  catchAsync(MemberController.inviteMember)
);

// List pending/accepted invitations for organization
router.get('/:id/invitations', catchAsync(MemberController.getInvitations));

// Resend pending invitation
router.post(
  '/:id/invitations/:inviteId/resend',
  catchAsync(MemberController.resendInvite)
);

// Cancel/Delete invitation
router.delete(
  '/:id/invitations/:inviteId',
  catchAsync(MemberController.cancelInvite)
);

// Remove member from organization
router.delete(
  '/:id/members/:memberId',
  catchAsync(MemberController.removeMember)
);

// Update member role
router.patch(
  '/:id/members/:memberId/role',
  validateRequest(updateMemberRoleSchema),
  catchAsync(MemberController.updateMemberRole)
);

// Leave organization
router.post('/:id/leave', catchAsync(MemberController.leaveOrganization));

// Transfer ownership
router.post(
  '/:id/transfer-ownership',
  catchAsync(MemberController.transferOwnership)
);

export default router;

