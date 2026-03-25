import Job from '../../shared/models/Job.js';

export const setJobProgress = async (jobId, percentage, step) => {
  try {
    return await Job.findByIdAndUpdate(
      jobId,
      {
        progress: {
          percentage,
          step,
        },
      },
      { new: true },
    );
  } catch (error) {
    console.error(`Error updating job progress: ${error.message}`);
    return null;
  }
};
