import { ActivityService, GetActivitiesQueryParams, RecordActivityDTO } from './activity.service';

export class AuditService {
  /**
   * Log an enterprise security or operational audit event
   */
  public static async logAuditEvent(event: RecordActivityDTO) {
    return ActivityService.recordActivity(event);
  }

  /**
   * Fetch security audit logs with filtering
   */
  public static async getAuditLogs(params: GetActivitiesQueryParams) {
    return ActivityService.getActivities(params);
  }

  /**
   * Generate audit log compliance reports
   */
  public static async exportAuditLogs(
    params: GetActivitiesQueryParams,
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ) {
    return ActivityService.exportActivities(params, format);
  }
}
