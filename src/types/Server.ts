export type HealthCheck = {
  name: string
  run: () => Promise<unknown>
}
