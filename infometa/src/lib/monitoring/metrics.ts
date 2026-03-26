// OpenTelemetry metrics placeholder
// Wire up with @opentelemetry/sdk-node when deploying to production

export const metrics = {
  verifyLatency: (ms: number) => {
    // Record verification latency
    if (process.env.ENABLE_METRICS === 'true') {
      // TODO: push to OTEL collector
    }
  },
  scanCount: (status: string) => {
    if (process.env.ENABLE_METRICS === 'true') {
      // TODO: increment counter
    }
  },
  alertTriggered: (type: string) => {
    if (process.env.ENABLE_METRICS === 'true') {
      // TODO: increment counter
    }
  },
};
