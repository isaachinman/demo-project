import { db } from './client'
import { users } from './schema'

// Fixed ids make the seed idempotent: Railway runs init on every deploy.
export const SEEDED_USERS = [
  { id: '0a1c7f0e-4b0e-4f7a-9a51-6f1d2a3b4c01', name: 'Alex' },
  { id: '0a1c7f0e-4b0e-4f7a-9a51-6f1d2a3b4c02', name: 'Sam' },
  { id: '0a1c7f0e-4b0e-4f7a-9a51-6f1d2a3b4c03', name: 'Priya' },
]

export const seedUsers = () => db.insert(users).values(SEEDED_USERS).onConflictDoNothing()
