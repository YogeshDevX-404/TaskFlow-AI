import {
  NotificationPreferenceModel,
  INotificationPreferencePayload,
} from '../models/notification-preference.model';
import { Types } from 'mongoose';

export class NotificationPreferenceService {
  async getPreferences(userId: string): Promise<INotificationPreferencePayload> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    let pref = await NotificationPreferenceModel.findOne({ user: userId });

    if (!pref) {
      pref = new NotificationPreferenceModel({
        user: new Types.ObjectId(userId),
        emailNotifications: true,
        inAppNotifications: true,
        taskNotifications: true,
        commentNotifications: true,
        mentionNotifications: true,
        projectNotifications: true,
        sprintNotifications: true,
        releaseNotifications: true,
        dailyDigest: false,
        weeklyDigest: true,
      });
      await pref.save();
    }

    return pref.toPayload();
  }

  async updatePreferences(
    userId: string,
    updateData: Partial<INotificationPreferencePayload>
  ): Promise<INotificationPreferencePayload> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const pref = await NotificationPreferenceModel.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return pref.toPayload();
  }
}

export const notificationPreferenceService = new NotificationPreferenceService();
