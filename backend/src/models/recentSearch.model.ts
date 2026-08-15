import { Schema, Document, model, Types } from 'mongoose';

export interface IRecentSearchDocument extends Document {
  user: Types.ObjectId;
  query: string;
  category?: string;
  filters?: Record<string, any>;
  lastSearchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecentSearchSchema = new Schema<IRecentSearchDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      default: 'all',
      trim: true,
    },
    filters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    lastSearchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

RecentSearchSchema.index({ user: 1, query: 1 }, { unique: true });
RecentSearchSchema.index({ user: 1, lastSearchedAt: -1 });

export const RecentSearchModel = model<IRecentSearchDocument>(
  'RecentSearch',
  RecentSearchSchema
);
