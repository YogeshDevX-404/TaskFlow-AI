import mongoose, { Schema, SchemaDefinition, SchemaOptions } from 'mongoose';

export interface IBaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const baseSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

export function createBaseSchema(
  schemaDefinition: SchemaDefinition
): Schema {
  return new Schema(schemaDefinition, baseSchemaOptions);
}
