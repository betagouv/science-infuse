// jobs.ts
import { queue, queueManager } from "./boss";
import { autoIndexYoutubeWorker } from "./jobs/index-contents/auto-index-youtube";
import { IndexContentWorker } from "./jobs/index-contents/index-content";
import { ReindexYoutubeWorker } from "./jobs/reindex-youtube";

export async function registerJobs() {
  console.log("Starting to register jobs...");

  // Register workers
  queueManager.register(IndexContentWorker);
  queueManager.register(ReindexYoutubeWorker);
  queueManager.register(autoIndexYoutubeWorker);
  console.log("Workers registered");


  // Start the queue manager
  await queueManager.start();


  // Schedule the reindex-youtube job to run every week
  try {
    await queue.schedule('scheduled.reindex-youtube', '0 0 * * 6', {});
    console.log("Reindex Youtube job scheduled successfully");
  } catch (error) {
    console.error("Error scheduling Reindex Youtube job:", error);
  }
  console.log("queueManager started");
}