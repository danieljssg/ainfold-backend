import { Queue } from 'bullmq';
import { WorkerConnection } from '../../config/redis.js';

export const mainQueue = new Queue('mainStream', {
  connection: WorkerConnection,
});

export const analysisQueue = new Queue('analysisStream', {
  connection: WorkerConnection,
});

export const addAudioQueue = new Queue('audioStream', {
  connection: WorkerConnection,
});

export const addJob = (name, data) => {
  return mainQueue.add(name, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

export const addJobAnalysis = (name, data) => {
  return analysisQueue.add(name, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

export const addJobAudio = (name, data) => {
  return addAudioQueue.add(name, data, {
    jobId: data.analysisId,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};

export const addAnyQueueJob = (queueName, name, data) => {
  const queue = new Queue(queueName, {
    connection: WorkerConnection,
  });
  return queue.add(name, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};
