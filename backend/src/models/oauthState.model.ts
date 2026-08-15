import { Schema, Document, model, Types } from 'mongoose';

export interface IOAuthStateDocument extends Document {
  state: string;
  userId: Types.ObjectId;
  redirectUri?: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OAuthStateSchema = new Schema<IOAuthStateDocument>(
  {
    state: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    redirectUri: {
      type: String,
      default: '',
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Expire state documents automatically after expiresAt
OAuthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthStateModel = model<IOAuthStateDocument>('OAuthState', OAuthStateSchema);
