import { Schema, model } from 'mongoose';

const CandidateDataSchema = new Schema(
  {
    fullName: { type: String, default: 'N/A' },
    profession: { type: String, default: 'N/A' },
    age: { type: String, default: 'N/A' },
    email: { type: String, default: 'N/A' },
    phone: { type: String, default: 'N/A' },
    dni: { type: String, default: 'N/A' },
  },
  { _id: false },
);

const FunctionalAreaSchema = new Schema(
  {
    area: { type: String, default: 'N/A' },
    score: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

const jobSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hobby: { type: String, trim: true },
    feel: {
      type: String,
      enum: ['dramatic', 'poetic', 'sharp', 'visionary', 'technical'],
      default: 'dramatic',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    result: {
      candidateData: CandidateDataSchema,
      functionalArea: FunctionalAreaSchema,
      occupation: String,
      ai_insight: String,
      summary: String,
    },
    error: { type: String },
    attempts: { type: Number, default: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

jobSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default model('Job', jobSchema);
