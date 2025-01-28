// jobs.ts
import { queue, queueManager } from "./boss";
import { indexContentWorker } from "./jobs/index-contents";
import { ReindexYoutubeWorker } from "./jobs/reindex-youtube";

export async function registerJobs() {
  console.log("Starting to register jobs...");

  // Register workers
  queueManager.register(indexContentWorker);
  queueManager.register(ReindexYoutubeWorker);
  console.log("Workers registered");


  // Start the queue manager
  await queueManager.start();


  // Schedule the reindex-youtube job to run every week
  try {
    await queue.schedule('scheduled.reindex-youtube', '0 0 * * 0', {});
    console.log("Reindex Youtube job scheduled successfully");
  } catch (error) {
    console.error("Error scheduling Reindex Youtube job:", error);
  }
  console.log("queueManager started");
}