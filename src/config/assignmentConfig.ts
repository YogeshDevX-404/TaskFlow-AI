export const ASSIGNMENT_CONFIG = {
  MAX_REFERENCE_IMAGES: 20,
  MAX_REFERENCE_FILES: 30,
  MAX_PROOF_ATTACHMENTS: 30,
  MAX_IMAGE_SIZE_BYTES: 25 * 1024 * 1024, // 25 MB
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100 MB
  MAX_PROOF_SIZE_BYTES: 50 * 1024 * 1024, // 50 MB
  ALLOWED_IMAGE_EXTENSIONS: ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'],
  ALLOWED_IMAGE_MIME_TYPES: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/gif',
  ],
  ALLOWED_DOCUMENT_EXTENSIONS: [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'csv',
    'txt',
    'md',
    'json',
    'zip',
  ],
  DANGEROUS_EXTENSIONS: [
    'exe',
    'bat',
    'cmd',
    'sh',
    'ps1',
    'vbs',
    'msi',
    'dll',
    'scr',
    'com',
    'pif',
    'jar',
    'py',
    'php',
    'jsp',
    'asp',
    'aspx',
    'cgi',
  ],
  PROOF_CATEGORIES: [
    'Progress Evidence',
    'Before',
    'After',
    'Testing',
    'Final Result',
    'Bug/Issue Evidence',
  ] as const,
  ACCEPTANCE_CRITERIA_STATUSES: [
    'Completed',
    'Not Completed',
    'Blocked',
  ] as const,
  SUBMISSION_STATUSES: [
    'Submitted',
    'Under Review',
    'Changes Requested',
    'Approved',
    'Rejected',
    'Completed',
  ] as const,
};

export type ProofCategory = typeof ASSIGNMENT_CONFIG.PROOF_CATEGORIES[number];
export type AcceptanceCriterionStatus = typeof ASSIGNMENT_CONFIG.ACCEPTANCE_CRITERIA_STATUSES[number];
export type SubmissionStatus = typeof ASSIGNMENT_CONFIG.SUBMISSION_STATUSES[number];
