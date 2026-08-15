import mongoose from 'mongoose';
import { DatabaseConnection } from '../database/connection';

export class DatabaseService {
  public static async checkHealth(): Promise<{ status: string; readyState: number; dbName?: string }> {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const readyState = mongoose.connection.readyState;
    const status = states[readyState] || 'unknown';

    return {
      status,
      readyState,
      dbName: mongoose.connection.name,
    };
  }

  public static async ping(): Promise<boolean> {
    return DatabaseConnection.isConnected();
  }
}
