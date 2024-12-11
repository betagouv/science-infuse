import { queueManager } from "./boss";
import { indexContentWorker } from "./jobs/index-content";

export async function registerJobs() {
  queueManager.register(indexContentWorker);
  //start
  await queueManager.start();
  console.log("queueManager started")
}