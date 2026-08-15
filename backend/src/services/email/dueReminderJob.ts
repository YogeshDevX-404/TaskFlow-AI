import { TaskModel } from '../../models/task.model';
import { EmailService } from '../email.service';

export class DueReminderScheduler {
  /**
   * Scans database for tasks approaching due date or overdue and sends reminder emails
   */
  public static async runReminderCheck(): Promise<{ processedCount: number; sentCount: number }> {
    let processedCount = 0;
    let sentCount = 0;

    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find unarchived tasks that are not Done or Cancelled with a due date
      const query: any = {
        status: { $nin: ['Done', 'Cancelled'] },
        dueDate: { $ne: null, $lte: in24Hours },
        assignee: { $ne: null },
      };

      const tasks = await TaskModel.find(query)
        .populate('project', 'name projectKey')
        .populate('assignee', 'firstName lastName email');

      for (const task of tasks) {
        if (!task.assignee || !task.dueDate) continue;

        processedCount++;
        const isOverdue = task.dueDate < now;
        const assigneeUser = task.assignee as any;
        const projectObj = task.project as any;

        const result = await EmailService.sendDueDateReminderEmail({
          recipientUserId: assigneeUser._id ? assigneeUser._id.toString() : assigneeUser.id,
          taskKey: task.taskKey,
          taskTitle: task.title,
          projectName: projectObj ? projectObj.name : 'Project',
          dueDate: task.dueDate.toLocaleDateString('en-US', { dateStyle: 'medium' }),
          isOverdue,
          taskId: task._id.toString(),
        });

        if (result.success) {
          sentCount++;
        }
      }
    } catch (err: any) {
      console.error(`[DueReminderScheduler] Error running reminder scan: ${err.message}`);
    }

    return { processedCount, sentCount };
  }
}
