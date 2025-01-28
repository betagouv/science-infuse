
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerJobs } = await import("@/queueing/pgboss/jobs");

    await registerJobs();
  }
}