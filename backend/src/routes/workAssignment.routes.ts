import { Router } from 'express';
import { WorkAssignmentController } from '../controllers/workAssignment.controller';
import { CommentController } from '../controllers/comment.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// All work assignment routes require authentication
router.use(authenticateUser);

router.get('/my', catchAsync(WorkAssignmentController.getMyAssignments));
router.get('/developer-workload/:developerId', catchAsync(WorkAssignmentController.getDeveloperWorkload));

// Dashboard & Monitoring Endpoints
router.get('/dashboard/summary', catchAsync(WorkAssignmentController.getDashboardSummary));
router.get('/dashboard/developers', catchAsync(WorkAssignmentController.getDeveloperMonitoringStats));
router.get('/dashboard/projects', catchAsync(WorkAssignmentController.getProjectMonitoringStats));
router.get('/dashboard/review-queue', catchAsync(WorkAssignmentController.getReviewQueue));
router.get('/dashboard/attention-needed', catchAsync(WorkAssignmentController.getAttentionNeeded));
router.get('/dashboard/timeline', catchAsync(WorkAssignmentController.getAssignmentTimeline));

// Bulk Action Endpoints
router.post('/bulk/reassign', catchAsync(WorkAssignmentController.bulkReassign));
router.post('/bulk/priority', catchAsync(WorkAssignmentController.bulkUpdatePriority));
router.post('/bulk/status', catchAsync(WorkAssignmentController.bulkUpdateStatus));
router.post('/bulk/archive', catchAsync(WorkAssignmentController.bulkArchive));

// Reports & Export Endpoints
router.get('/reports/:reportType', catchAsync(WorkAssignmentController.getReports));
router.get('/export', catchAsync(WorkAssignmentController.exportAssignments));

// Drilldown Endpoints
router.get('/developers/:developerId/details', catchAsync(WorkAssignmentController.getDeveloperDetails));
router.get('/projects/:projectId/details', catchAsync(WorkAssignmentController.getProjectDetails));

router.get('/', catchAsync(WorkAssignmentController.getAssignments));
router.post('/', catchAsync(WorkAssignmentController.createAssignment));

router.get('/:id', catchAsync(WorkAssignmentController.getAssignmentById));
router.put('/:id', catchAsync(WorkAssignmentController.updateAssignment));
router.delete('/:id', catchAsync(WorkAssignmentController.deleteAssignment));

router.patch('/:id/status', catchAsync(WorkAssignmentController.updateStatus));
router.post('/:id/progress', catchAsync(WorkAssignmentController.updateProgress));
router.post('/:id/reassign', catchAsync(WorkAssignmentController.reassign));
router.post('/:id/submit', catchAsync(WorkAssignmentController.submitWork));
router.post('/:id/review', catchAsync(WorkAssignmentController.reviewSubmission));

// Reference Images
router.post('/:id/reference-images', catchAsync(WorkAssignmentController.addReferenceImages));
router.patch('/:id/reference-images/:imageId', catchAsync(WorkAssignmentController.updateReferenceImage));
router.put('/:id/reference-images/reorder', catchAsync(WorkAssignmentController.reorderReferenceImages));
router.delete('/:id/reference-images/:imageId', catchAsync(WorkAssignmentController.removeReferenceImage));

// Instructions & Expected Results
router.put('/:id/instruction-steps', catchAsync(WorkAssignmentController.updateInstructionSteps));
router.put('/:id/expected-result', catchAsync(WorkAssignmentController.updateExpectedResult));

// Acceptance Criteria
router.post('/:id/acceptance-criteria', catchAsync(WorkAssignmentController.addAcceptanceCriterion));
router.patch('/:id/acceptance-criteria/:criterionId', catchAsync(WorkAssignmentController.updateAcceptanceCriterionStatus));
router.delete('/:id/acceptance-criteria/:criterionId', catchAsync(WorkAssignmentController.removeAcceptanceCriterion));

// Proof of Work
router.post('/:id/proof-of-work', catchAsync(WorkAssignmentController.addProofOfWork));
router.delete('/:id/proof-of-work/:proofId', catchAsync(WorkAssignmentController.removeProofOfWork));

// Comments
router.get('/:id/comments', catchAsync(CommentController.getAssignmentComments));
router.post('/:id/comments', catchAsync(CommentController.createAssignmentComment));

export default router;
