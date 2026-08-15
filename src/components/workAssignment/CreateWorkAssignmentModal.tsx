import React, { useState, useEffect } from 'react';
import {
  AssignmentPriority,
  CreateAssignmentInput,
  DeveloperWorkloadStats,
  IInstructionStep,
  IExpectedResult,
  IReferenceImage,
  IAcceptanceCriterion,
} from '../../types/workAssignment';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useMemberStore } from '../../store/useMemberStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import {
  X,
  Plus,
  AlertTriangle,
  FolderKanban,
  User,
  Clock,
  CheckSquare,
  FileText,
  GitPullRequest,
  Paperclip,
  Trash2,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  ListOrdered,
  Target,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDeveloperId?: string | null;
}

type ModalSection = 'basic' | 'steps' | 'expected' | 'images' | 'criteria' | 'links';

export const CreateWorkAssignmentModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  preselectedDeveloperId,
}) => {
  const { activeOrganization } = useOrganizationStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { projects } = useProjectStore();
  const { members } = useMemberStore();
  const { tasks } = useTaskStore();
  const { createAssignment, fetchDeveloperWorkload, actionLoading, error } =
    useWorkAssignmentStore();

  const [activeSection, setActiveSection] = useState<ModalSection>('basic');

  // Basic Info
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [assignedToId, setAssignedToId] = useState(preselectedDeveloperId || '');
  const [priority, setPriority] = useState<AssignmentPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('4');
  const [estimatedMinutes, setEstimatedMinutes] = useState('0');

  // Step-by-Step Instructions
  const [steps, setSteps] = useState<IInstructionStep[]>([]);
  const [stepTitle, setStepTitle] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  const [stepIsRequired, setStepIsRequired] = useState(true);

  // Expected Result
  const [expectedDescription, setExpectedDescription] = useState('');
  const [uiPreviewDetails, setUiPreviewDetails] = useState('');
  const [apiExpectedResponse, setApiExpectedResponse] = useState('');
  const [behavioralNotes, setBehavioralNotes] = useState('');
  const [successConditionInput, setSuccessConditionInput] = useState('');
  const [successConditions, setSuccessConditions] = useState<string[]>([]);

  // Reference Images
  const [referenceImages, setReferenceImages] = useState<Array<Partial<IReferenceImage>>>([]);
  const [imageFileUrl, setImageFileUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageDescription, setImageDescription] = useState('');

  // Acceptance Criteria
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<
    Array<{ title: string; description?: string; isRequired: boolean }>
  >([]);
  const [criterionTitle, setCriterionTitle] = useState('');
  const [criterionDescription, setCriterionDescription] = useState('');
  const [criterionRequired, setCriterionRequired] = useState(true);

  // GitHub Links & Resources
  const [githubPrUrl, setGithubPrUrl] = useState('');
  const [githubIssueUrl, setGithubIssueUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  // Selected developer workload check
  const [devWorkload, setDevWorkload] = useState<DeveloperWorkloadStats | null>(null);

  useEffect(() => {
    if (preselectedDeveloperId) {
      setAssignedToId(preselectedDeveloperId);
    }
  }, [preselectedDeveloperId]);

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  useEffect(() => {
    if (assignedToId) {
      fetchDeveloperWorkload(assignedToId).then((data) => {
        setDevWorkload(data);
      });
    } else {
      setDevWorkload(null);
    }
  }, [assignedToId, fetchDeveloperWorkload]);

  if (!isOpen) return null;

  const projectTasks = tasks.filter(
    (t) => !projectId || t.projectId === projectId || (t as any).project === projectId
  );

  // Helper to add Step
  const handleAddStep = () => {
    if (!stepTitle.trim()) return;
    const newStep: IInstructionStep = {
      id: `step_${Date.now()}`,
      stepNumber: steps.length + 1,
      title: stepTitle.trim(),
      description: stepDescription.trim() || undefined,
      isRequired: stepIsRequired,
    };
    setSteps([...steps, newStep]);
    setStepTitle('');
    setStepDescription('');
    setStepIsRequired(true);
  };

  const handleRemoveStep = (index: number) => {
    const updated = steps
      .filter((_, i) => i !== index)
      .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setSteps(updated);
  };

  // Helper to add Success Condition
  const handleAddSuccessCondition = () => {
    if (!successConditionInput.trim()) return;
    setSuccessConditions([...successConditions, successConditionInput.trim()]);
    setSuccessConditionInput('');
  };

  const handleRemoveSuccessCondition = (idx: number) => {
    setSuccessConditions(successConditions.filter((_, i) => i !== idx));
  };

  // Helper to add Reference Image
  const handleAddReferenceImage = () => {
    if (!imageFileUrl.trim()) return;
    const newImg: Partial<IReferenceImage> = {
      id: `img_${Date.now()}`,
      fileName: imageFileName.trim() || `Reference Image ${referenceImages.length + 1}`,
      originalName: imageFileName.trim() || `Reference Image ${referenceImages.length + 1}`,
      fileUrl: imageFileUrl.trim(),
      caption: imageCaption.trim() || undefined,
      description: imageDescription.trim() || undefined,
      order: referenceImages.length,
      fileType: 'image',
      mimeType: 'image/png',
      fileSize: 1024 * 500,
    };
    setReferenceImages([...referenceImages, newImg]);
    setImageFileUrl('');
    setImageFileName('');
    setImageCaption('');
    setImageDescription('');
  };

  const handleRemoveReferenceImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  // Helper to add Acceptance Criterion
  const handleAddCriterion = () => {
    if (!criterionTitle.trim()) return;
    setAcceptanceCriteria([
      ...acceptanceCriteria,
      {
        title: criterionTitle.trim(),
        description: criterionDescription.trim() || undefined,
        isRequired: criterionRequired,
      },
    ]);
    setCriterionTitle('');
    setCriterionDescription('');
    setCriterionRequired(true);
  };

  const handleRemoveCriterion = (index: number) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((_, i) => i !== index));
  };

  // Helper to add General Attachment
  const handleAddAttachment = () => {
    if (!attachmentUrl.trim() || !attachmentName.trim()) return;
    const newAtt = {
      id: `att_${Date.now()}`,
      fileName: attachmentName.trim(),
      originalName: attachmentName.trim(),
      fileUrl: attachmentUrl.trim(),
      fileType: 'link',
      mimeType: 'text/uri-list',
      fileSize: 1024,
      uploadedBy: activeOrganization?.owner || 'current_user',
    };
    setAttachments([...attachments, newAtt]);
    setAttachmentUrl('');
    setAttachmentName('');
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim() || !projectId || !assignedToId) {
      setActiveSection('basic');
      return;
    }

    const orgId = activeOrganization?.id;
    const wsId = activeWorkspace?.id;

    if (!orgId || !wsId) return;

    const expectedResultData: IExpectedResult = {
      description: expectedDescription.trim() || '',
      uiPreviewDetails: uiPreviewDetails.trim() || undefined,
      apiExpectedResponse: apiExpectedResponse.trim() || undefined,
      behavioralNotes: behavioralNotes.trim() || undefined,
      successConditions: successConditions.length > 0 ? successConditions : undefined,
    };

    const inputData: CreateAssignmentInput = {
      organizationId: orgId,
      workspaceId: wsId,
      projectId,
      taskId: taskId || undefined,
      assignedToId,
      title: title.trim(),
      instructions: instructions.trim(),
      description: description.trim() || undefined,
      instructionSteps: steps.length > 0 ? steps : undefined,
      expectedResult: expectedDescription.trim() || successConditions.length > 0 ? expectedResultData : undefined,
      referenceImages: referenceImages.length > 0 ? (referenceImages as any) : undefined,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? (acceptanceCriteria as any) : undefined,
      priority,
      dueDate: dueDate || undefined,
      estimatedHours: parseInt(estimatedHours, 10) || 0,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 0,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    if (githubPrUrl.trim()) {
      inputData.githubPullRequest = {
        prNumber: 1,
        title: 'Linked Pull Request',
        state: 'open',
        url: githubPrUrl.trim(),
      };
    }

    if (githubIssueUrl.trim()) {
      inputData.githubIssue = {
        issueNumber: 1,
        title: 'Linked Issue',
        state: 'open',
        url: githubIssueUrl.trim(),
      };
    }

    const created = await createAssignment(inputData);
    if (created) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Create & Assign Work Package
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dispatch requirements, step instructions, expected outcome, reference images & acceptance criteria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold bg-white dark:bg-slate-900 py-2">
          <button
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'basic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Basic Info *</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('steps')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'steps'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Steps ({steps.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('expected')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'expected'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Expected Result</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('images')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'images'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Reference Images ({referenceImages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('criteria')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'criteria'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acceptance Criteria ({acceptanceCriteria.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('links')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSection === 'links'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>GitHub & Links</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. BASIC INFO SECTION */}
            {activeSection === 'basic' && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Assignment Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement OAuth2 Refresh Token Rotation with Redis Storage"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Developer & Project Selectors (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Developer Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Assign to Developer <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="">Select a developer...</option>
                      {members.map((m) => {
                        const u = m.user;
                        const devId = u?.id || (u as any)?._id || m.id;
                        const name =
                          `${u?.firstName || ''} ${u?.lastName || ''}`.trim() ||
                          (u as any)?.name ||
                          u?.email ||
                          'Developer';
                        return (
                          <option key={devId} value={devId}>
                            {name} ({m.role || 'Member'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Project Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Project <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={projectId}
                      onChange={(e) => {
                        setProjectId(e.target.value);
                        setTaskId('');
                      }}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="">Select a project...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Developer Workload Banner */}
                {devWorkload && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      devWorkload.activeAssignmentsCount >= 5
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                        : devWorkload.activeAssignmentsCount >= 3
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Developer Workload:</strong> {devWorkload.activeAssignmentsCount} active assignments ({devWorkload.totalEstimatedHours}h est).
                        {devWorkload.overdueAssignmentsCount > 0 && ` (${devWorkload.overdueAssignmentsCount} overdue)`}
                      </span>
                    </div>
                    {devWorkload.capacityWarning && (
                      <span className="font-bold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 shrink-0">
                        {devWorkload.capacityWarning}
                      </span>
                    )}
                  </div>
                )}

                {/* Instructions / Scope Summary */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    General Instructions & Overview <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide technical overview and primary objective for this assignment..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* Priority, Due Date, and Estimated Hours Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent 🔥</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Estimated Hours
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                      <span className="text-xs text-slate-400 font-semibold">hrs</span>
                    </div>
                  </div>
                </div>

                {/* Linked Parent Task */}
                {projectTasks.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Link to Parent Task (Optional)
                    </label>
                    <select
                      value={taskId}
                      onChange={(e) => setTaskId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="">No linked task</option>
                      {projectTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.taskKey ? `[${t.taskKey}] ` : ''}
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* 2. STEP-BY-STEP INSTRUCTIONS SECTION */}
            {activeSection === 'steps' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Step-by-Step Implementation Guide
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Break down complex instructions into sequential executable steps for the developer.
                  </p>
                </div>

                {/* Add Step Input Form */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Step #{steps.length + 1} Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1. Create Redis connection helper in /src/config/redis.ts"
                      value={stepTitle}
                      onChange={(e) => setStepTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Step Details / Technical Guidance (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Ensure connection pooling and automatic reconnect handling with exponential backoff..."
                      value={stepDescription}
                      onChange={(e) => setStepDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stepIsRequired}
                        onChange={(e) => setStepIsRequired(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Mandatory step</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddStep}
                      disabled={!stepTitle.trim()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Step</span>
                    </button>
                  </div>
                </div>

                {/* Steps List */}
                {steps.length > 0 ? (
                  <div className="space-y-2">
                    {steps.map((step, idx) => (
                      <div
                        key={step.id || idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                              Step {step.stepNumber}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {step.title}
                            </span>
                            {step.isRequired && (
                              <span className="text-[10px] text-rose-500 font-semibold">
                                (Required)
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] pl-1">
                              {step.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                    No steps added yet. You can add sequential steps to provide a clean roadmap.
                  </div>
                )}
              </div>
            )}

            {/* 3. EXPECTED RESULT SECTION */}
            {activeSection === 'expected' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Definition of Done & Expected Result
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Detail exactly what the completed deliverable looks and behaves like upon delivery.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Overall Expected Outcome Summary
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. When the user logs in, tokens are securely rotated without session drops..."
                    value={expectedDescription}
                    onChange={(e) => setExpectedDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      UI / Visual Preview Expectations
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Clean modal with responsive Tailwind styling and dark mode support..."
                      value={uiPreviewDetails}
                      onChange={(e) => setUiPreviewDetails(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      API / Backend Response Expectations
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Returns { success: true, token: '...', expiresAt: 12345 } with HTTP 200..."
                      value={apiExpectedResponse}
                      onChange={(e) => setApiExpectedResponse(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Behavioral & Edge Cases Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Gracefully handle network disconnects, invalid tokens should return 401..."
                    value={behavioralNotes}
                    onChange={(e) => setBehavioralNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* Success Conditions List */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Success Conditions Checklist
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Unit tests pass with >80% code coverage"
                      value={successConditionInput}
                      onChange={(e) => setSuccessConditionInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddSuccessCondition}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Add Condition
                    </button>
                  </div>

                  {successConditions.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {successConditions.map((cond, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{cond}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSuccessCondition(idx)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. REFERENCE IMAGES SECTION */}
            {activeSection === 'images' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Visual Reference Images & Design Mockups
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Attach Figma screenshots, wireframes, UI mockups, or architectural diagrams for developer guidance.
                  </p>
                </div>

                {/* Add Reference Image Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Image URL / Link <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or Figma asset URL"
                        value={imageFileUrl}
                        onChange={(e) => setImageFileUrl(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Image Title / Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dashboard Settings Wireframe"
                        value={imageFileName}
                        onChange={(e) => setImageFileName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Caption (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Desktop 1440px breakpoint layout"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Description / Annotations
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Note the corner radius and pill badges"
                        value={imageDescription}
                        onChange={(e) => setImageDescription(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddReferenceImage}
                      disabled={!imageFileUrl.trim()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Reference Image</span>
                    </button>
                  </div>
                </div>

                {/* Reference Images Grid */}
                {referenceImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {referenceImages.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 relative group"
                      >
                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          <img
                            src={img.fileUrl}
                            alt={img.fileName || 'Reference'}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as any).src = 'https://placehold.co/100x100?text=Image';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1 text-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {img.fileName}
                          </p>
                          {img.caption && (
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                              {img.caption}
                            </p>
                          )}
                          {img.description && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {img.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveReferenceImage(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                    No reference images attached. Adding images helps developers match designs with 100% fidelity.
                  </div>
                )}
              </div>
            )}

            {/* 5. ACCEPTANCE CRITERIA SECTION */}
            {activeSection === 'criteria' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Interactive Acceptance Criteria Checklist
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Define discrete QA test points and requirements that the developer can tick off during implementation.
                  </p>
                </div>

                {/* Add Criterion Form */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Criterion Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Invalidate existing refresh token immediately upon reuse attempt"
                      value={criterionTitle}
                      onChange={(e) => setCriterionTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Criterion Description / Testing Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ensure security audit log is emitted when token reuse is flagged"
                      value={criterionDescription}
                      onChange={(e) => setCriterionDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={criterionRequired}
                        onChange={(e) => setCriterionRequired(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Required for approval</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddCriterion}
                      disabled={!criterionTitle.trim()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Criterion</span>
                    </button>
                  </div>
                </div>

                {/* Acceptance Criteria List */}
                {acceptanceCriteria.length > 0 ? (
                  <div className="space-y-2">
                    {acceptanceCriteria.map((crit, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="font-bold text-slate-900 dark:text-white">
                              {crit.title}
                            </span>
                            {crit.isRequired && (
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                                Required
                              </span>
                            )}
                          </div>
                          {crit.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                              {crit.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCriterion(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                    No acceptance criteria added yet.
                  </div>
                )}
              </div>
            )}

            {/* 6. GITHUB & EXTERNAL RESOURCES SECTION */}
            {activeSection === 'links' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    GitHub Links & Documentation Resources
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Connect GitHub repository PRs/Issues and attach shared drive/spec documents.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <GitPullRequest className="w-3.5 h-3.5 text-purple-500" />
                      <span>GitHub PR URL (Optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/org/repo/pull/12"
                      value={githubPrUrl}
                      onChange={(e) => setGithubPrUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-sky-500" />
                      <span>GitHub Issue URL (Optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/org/repo/issues/45"
                      value={githubIssueUrl}
                      onChange={(e) => setGithubIssueUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Attachments / Reference Links */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                    <span>External Resource & Specification Links</span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Doc Name (e.g. API Spec Doc)"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="w-1/3 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                    <input
                      type="url"
                      placeholder="https://docs.google.com/... or Figma link"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttachment}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {attachments.map((att, idx) => (
                        <div
                          key={att.id || idx}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {att.fileName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-xs text-slate-400">
              {activeSection === 'basic' ? (
                <span>Tip: Fill in steps, expected outcome & criteria for best results</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveSection('basic')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  &larr; Back to Basic Info
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <span>Assigning...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Assign Work</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
