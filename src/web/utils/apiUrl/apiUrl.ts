// Empty in dev, where Vite proxies /api; the API's origin in production, where Pages serves the web app.
const API_ORIGIN: string = import.meta.env.VITE_API_ORIGIN ?? ''

export const apiUrl = (path: string) => `${API_ORIGIN}${path}`
