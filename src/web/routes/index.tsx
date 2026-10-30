import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '@demo-project/web/components/home/HomePage'

export const Route = createFileRoute('/')({
  component: HomePage,
})
