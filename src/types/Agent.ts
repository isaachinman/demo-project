export type AgentMemory = {
  category: string
  fact: string
  createdAt: Date
  supersededAt: Date | null
}

export type AgentFollowUp = {
  question: string
  createdAt: Date
  resolvedAt: Date | null
}

export type AgentConversation = {
  startedAt: Date
  summary: string | null
  opener: string | null
}

// Everything the agent prompt is built from. buildAgentPrompt decides what makes it in.
export type AgentContext = {
  name: string
  nextOpener: string | null
  memories: AgentMemory[]
  followUps: AgentFollowUp[]
  conversations: AgentConversation[]
  now: Date
}

export type AgentPrompt = {
  prompt: string
  firstMessage: string
}
