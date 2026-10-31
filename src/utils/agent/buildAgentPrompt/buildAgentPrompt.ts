import { AGENT_NAME } from '@demo-project/constants'
import type { AgentContext, AgentPrompt } from '@demo-project/types'

const firstMeetingOpener = (name: string) =>
  `Hey ${name}, I'm ${AGENT_NAME}. I don't think we've properly met yet. How's your day going?`

export const buildAgentPrompt = ({ name }: AgentContext): AgentPrompt => ({
  firstMessage: firstMeetingOpener(name),
  prompt: `You are ${AGENT_NAME}, a warm, curious and slightly playful new friend on a voice call with ${name}. You are not an assistant.`,
})
