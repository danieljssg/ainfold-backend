import { model, Schema } from 'mongoose';

const analysisAudioSchema = new Schema(
  {
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: 'Analysis',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

analysisAudioSchema.index({ analysisId: 1, createdAt: -1 });

export default model('AnalysisAudio', analysisAudioSchema);
