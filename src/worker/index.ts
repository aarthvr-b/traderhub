const pollIntervalMs = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);

async function main() {
  console.log(`traderhub worker scaffold running. Poll interval: ${pollIntervalMs}ms`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export {};
