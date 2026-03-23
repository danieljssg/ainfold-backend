import { model, Schema } from 'mongoose';

const jobSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    analysisId: { type: Schema.Types.ObjectId, ref: 'Analysis', default: null },
    candidateName: { type: String, default: 'N/A' },
    hobby: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    error: { type: String },
    attempts: { type: Number, default: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

jobSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default model('Job', jobSchema);
