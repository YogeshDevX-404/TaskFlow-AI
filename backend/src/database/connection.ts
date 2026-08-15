import mongoose from 'mongoose';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';
import { seedRbacData } from './seedRbac';

export class DatabaseConnection {
  private static instance: typeof mongoose | null = null;

  public static async connect(): Promise<typeof mongoose> {
    if (this.instance) {
      logger.info('Reusing existing MongoDB connection.');
      return this.instance;
    }

    try {
      logger.info(`Connecting to MongoDB at URI: ${config.mongoUri.replace(/:([^@]+)@/, ':****@')}`);

      mongoose.set('strictQuery', true);

      // Connection event listeners
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connection established successfully.');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error encountered:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Reconnecting...');
      });

      const db = await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.instance = db;
      // Seed RBAC Permissions and System Roles
      seedRbacData().catch((err) => logger.error('Failed to seed RBAC data:', err));
      return db;
    } catch (error) {
      logger.error('Failed to establish MongoDB connection:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    if (this.instance) {
      await mongoose.disconnect();
      this.instance = null;
      logger.info('MongoDB connection closed gracefully.');
    }
  }

  public static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export const connectDB = DatabaseConnection.connect.bind(DatabaseConnection);
export const disconnectDB = DatabaseConnection.disconnect.bind(DatabaseConnection);
