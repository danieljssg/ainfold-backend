import { Schema, model } from 'mongoose';
import { functionalAreasNames } from '../utils/functionalAreas.js';

const AnalysisSchema = new Schema(
  {
    candidateData: {
      fullName: {
        type: String,
        default: 'N/A',
      },
      profession: {
        type: String,
        default: 'N/A',
      },
      age: {
        type: String,
        default: 'N/A',
      },
      email: {
        type: String,
        default: 'N/A',
      },
      phone: {
        type: String,
        default: 'N/A',
      },
      dni: {
        type: String,
        default: 'N/A',
      },
    },
    functionalArea: {
      area: {
        type: String,
        enum: functionalAreasNames,
        default: 'N/A',
      },
      score: {
        type: Number,
        min: 1.0,
        max: 5.0,
        default: 1,
      },
    },
    ai_insight: {
      type: String,
      default: 'N/A',
    },
    occupation: {
      type: String,
      default: 'N/A',
    },
    summary: {
      type: String,
      default: 'N/A',
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false,
  },
);

export default model('Analysis', AnalysisSchema);
