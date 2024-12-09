import PgBoss from "pg-boss";
import type { z } from "zod";


export function singleton<Value>(name: string, getValue: () => Value): Value {
  const thusly = globalThis as any;
  thusly.__remember_singleton ??= new Map<string, Value>();
  if (!thusly.__remember_singleton.has(name)) {
    thusly.__remember_singleton.set(name, getValue());
  }
  return thusly.__remember_singleton.get(name)!;
}

export const JOB_TYPES = {
  email: [
  ],
  data: [
    "index-file",
    "index-url"
  ],
} as const;
const CONNECTION_URL = process.env.DATABASE_URL as string;

const queue = singleton(
  "pg-boss",
  () =>
    new PgBoss({
      connectionString: CONNECTION_URL,
      max: 5,
      retryBackoff: true,
      retryLimit: 4,
      archiveCompletedAfterSeconds: 60 * 60 * 24 * 7, // 7 days
      deleteAfterDays: 7,
      retentionDays: 7,
      schema: "captable_queue",
    }),
);


type JobTypes = typeof JOB_TYPES;


type JobType = {
  [Key in keyof JobTypes]: `${Key}.${JobTypes[Key][number]}`;
}[keyof JobTypes];

interface WorkerFactory {
  name: JobType;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  handler: PgBoss.WorkHandler<any>;
}

function createQueue() {
  const jobs = new Map<string, WorkerFactory>();

  async function start() {
    console.log("Starting queue manager");

    queue.on("error", (error: any) => {
      console.log("error", {
        type: "queue",
        error,
      });
    });

    await queue.start();

    for (const [jobName, job] of Array.from(jobs)) {
      await queue.createQueue(jobName);
      await queue.work(jobName, job.handler);
    }
  }
  function register(jobFactory: WorkerFactory) {
    console.log("REGISTER", jobFactory.name)
    jobs.set(jobFactory.name, jobFactory);
  }

  return { start, register };
}

const queueManager = createQueue();

function defineWorker<
  U extends ReturnType<typeof defineWorkerConfig>,
  T extends U["schema"],
  V,
>(config: U, handler: (data: PgBoss.Job<z.infer<T>>) => Promise<V>) {
  return {
    name: config.name,
    handler: ([job]: PgBoss.Job<z.infer<T>>[]) => {
      if (!job) {
        throw new Error("");
      }

      return handler(job);
    },
  };
}

function defineJob<U extends ReturnType<typeof defineWorkerConfig>>(config: U) {
  type TSchema = U["schema"];
  return {
    emit: (data: z.infer<TSchema>, options?: PgBoss.JobOptions) => {
      const data_ = config.schema.parse(data);

      return queue.send(config.name, data_, options ?? {});
    },
    bulkEmit: (data: Omit<PgBoss.JobInsert<z.infer<TSchema>>, "name">[]) => {
      for (const item of data) {
        config.schema.parse(item.data);
      }

      return queue.insert(
        data.map((items) => ({ ...items, name: config.name })),
      );
    },
  };
}

interface defineWorkerConfigOptions<T> {
  schema: T;
  name: JobType;
}

function defineWorkerConfig<T extends z.ZodObject<any>>(
  opts: defineWorkerConfigOptions<T>,
) {
  return opts;
}

export { queue, queueManager, defineWorkerConfig, defineJob, defineWorker };