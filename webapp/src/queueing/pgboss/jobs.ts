import { queueManager } from "./boss";
import { indexFileWorker } from "./jobs/index-file";

export async function registerJobs() {
  queueManager.register(indexFileWorker);
  //start
  await queueManager.start();
  console.log("queueManager started")
}