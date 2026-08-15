export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  SORT_BY: 'createdAt',
  SORT_ORDER: 'desc' as const,
};

export const API_MESSAGES = {
  SUCCESS: 'Operation completed successfully.',
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  NOT_FOUND: 'Resource not found.',
  BAD_REQUEST: 'Invalid request data provided.',
  UNAUTHORIZED: 'Authentication credentials are missing or invalid.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INTERNAL_ERROR: 'An unexpected server error occurred. Please try again later.',
  PLACEHOLDER_ROUTE: 'Placeholder endpoint ready for business logic implementation.',
};

export const WORKLOAD_DEFAULTS = {
  WEEKLY_CAPACITY_HOURS: 40,
  DAILY_CAPACITY_HOURS: 8,
  WORKING_DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  TIMEZONE: 'UTC',
  START_OF_WEEK: 'Monday',
  END_OF_WEEK: 'Friday',
  THRESHOLDS: {
    AVAILABLE_MAX: 60, // Utilization < 60% is Available
    NORMAL_MAX: 85,    // Utilization 60% - 85% is Normal
    HIGH_MAX: 100,     // Utilization 85% - 100% is High
  },                   // Utilization > 100% is Overloaded
} as const;
