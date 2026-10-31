import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '@demo-project/web/components/home/HomePage'
import { loadUsers } from '@demo-project/web/stores/call/call.actions'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: loadUsers,
})
