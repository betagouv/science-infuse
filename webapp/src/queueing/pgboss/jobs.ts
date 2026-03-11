// jobs.ts
import { queue, queueManager } from "./boss";
import { autoIndexYoutubeWorker } from "./jobs/index-contents/auto-index-youtube";
import { IndexContentWorker } from "./jobs/index-contents/index-content";
import { ReindexYoutubeWorker } from "./jobs/reindex-youtube";
import { YoutubePurgeWorker } from "./jobs/youtube-purge";

export async function registerJobs() {
  console.log("Starting to register jobs...");

  // Register workers
  queueManager.register(IndexContentWorker);
  queueManager.register(ReindexYoutubeWorker);
  queueManager.register(autoIndexYoutubeWorker);
  queueManager.register(YoutubePurgeWorker);
  console.log("Workers registered");


  // Start the queue manager
  await queueManager.start();


  // Schedule the reindex-youtube job to run every week (Saturday)
  try {
    await queue.schedule('scheduled.reindex-youtube', '0 0 * * 6', {});
    console.log("Reindex Youtube job scheduled successfully");
  } catch (error) {
    console.error("Error scheduling Reindex Youtube job:", error);
  }

  // Schedule the youtube-purge job to run every week (Sunday)
  try {
    await queue.schedule('scheduled.youtube-purge', '0 2 * * 0', {
      purgeDelayDays: 90,
      batchSize: 100,
      maxApiCallsPerRun: 1000
    });
    console.log("YouTube Purge job scheduled successfully");
  } catch (error) {
    console.error("Error scheduling YouTube Purge job:", error);
  }
  console.log("queueManager started");
}