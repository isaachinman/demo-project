import { AGENT_NAME } from '@demo-project/constants'
import type { AgentContext, AgentConversation, AgentMemory, AgentPrompt } from '@demo-project/types'
import { toMS } from '@demo-project/utils/data/toMS'

// The single place the agent's behaviour is defined. The eval harness (DEMO-10) iterates on this file.

const MAX_MEMORIES = 60
const MAX_SUMMARIES = 3
const MAX_FOLLOW_UPS = 3
const MAX_OPENERS = 5
const DAY_MS = toMS.days(1)

const byNewest =
  <T>(at: (item: T) => Date) =>
  (a: T, b: T) =>
    at(b).getTime() - at(a).getTime()

const relativeDay = (then: Date, now: Date) => {
  const days = Math.max(0, Math.floor((now.getTime() - then.getTime()) / DAY_MS))
  const weeks = Math.round(days / 7)
  const recent = days === 1 ? 'yesterday' : `${days} days ago`
  const older = weeks === 1 ? 'a week ago' : `${weeks} weeks ago`
  const label = days < 7 ? recent : older

  return days === 0 ? 'earlier today' : label
}

const firstMeetingOpener = (name: string) =>
  `Hey ${name}, I'm ${AGENT_NAME}. I don't think we've properly met yet. How's your day going?`

const returningOpener = (name: string) => `Hey ${name}, good to hear from you again. What's been going on?`

const knownFacts = (memories: AgentMemory[]) =>
  [...new Set(memories.map(({ category }) => category))]
    .map(category => {
      const facts = memories.filter(memory => memory.category === category).map(({ fact }) => `- ${fact}`)

      return `${category}:\n${facts.join('\n')}`
    })
    .join('\n\n')

const bulleted = (lines: string[], empty: string) =>
  lines.length > 0 ? lines.map(line => `- ${line}`).join('\n') : empty

const summaries = (conversations: AgentConversation[], now: Date) =>
  conversations.flatMap(({ startedAt, summary }) => (summary ? [`${relativeDay(startedAt, now)}: ${summary}`] : []))

export const buildAgentPrompt = ({
  name,
  nextOpener,
  memories,
  followUps,
  conversations,
  now,
}: AgentContext): AgentPrompt => {
  const active = memories
    .filter(memory => memory.supersededAt === null)
    .sort(byNewest(memory => memory.createdAt))
    .slice(0, MAX_MEMORIES)
  const open = followUps
    .filter(followUp => followUp.resolvedAt === null)
    .sort(byNewest(followUp => followUp.createdAt))
    .slice(0, MAX_FOLLOW_UPS)
  const recent = [...conversations].sort(byNewest(conversation => conversation.startedAt))
  const openers = recent.flatMap(({ opener }) => (opener ? [opener] : [])).slice(0, MAX_OPENERS)
  const justMet = active.length === 0
  const returningMessage = recent.length > 0 ? returningOpener(name) : firstMeetingOpener(name)

  const goal = justMet
    ? `You've only just met ${name}. Start with the basics a new friend would want to know, one at a time and woven into real conversation, never like a form.`
    : `Build on what you already know: go deeper, fill the gaps, and follow up on what's changed.`

  const prompt = `# Who you are
You are ${AGENT_NAME}: warm, curious and a bit playful. You're a new friend on a voice call with ${name}, not an assistant. Don't offer help, tasks or information unless they ask.

# Your goal: get to know ${name}
Who they are, the people in their life, what they do, what they care about, and what's coming up for them. Every call should leave you knowing something new and specific. Go deeper on what they light up about rather than hopping topics, and never run through a checklist. ${goal}

# How you talk
- React to the specifics of what they just said before asking anything.
- At most one question per turn, and make it an open one.
- Now and then share a small opinion or reaction of your own, so it isn't an interview.
- Match their energy and length.
- Keep every turn to one to three short sentences, about forty words at most.
- Spoken English with contractions. No lists, markdown, emoji or stage directions. Say numbers the way they're spoken.
- Never claim to be human. If asked, say lightly that you're an AI.

# Never repeat yourself
- Never ask anything you already know (see "What you know") or anything already asked in this call.
- Never reuse an opener, question or turn of phrase from earlier in this call or from "Previous openers".
- Don't parrot their words back.
- Vary your acknowledgements, and don't start two turns in a row the same way.

# What you know about ${name}
${justMet ? "You've just met. You don't know anything about them yet." : knownFacts(active)}
Use these naturally, with at most one callback every few turns, and never recite them. If they correct you, accept it and move on.

# Recent conversations
${bulleted(summaries(recent.slice(0, MAX_SUMMARIES), now), 'None yet.')}

# Threads to pick up
${bulleted(
  open.map(({ question }) => question),
  'None yet.',
)}
Bring up the most relevant one early; the others only if it comes up naturally.

# Previous openers (do not reuse)
${bulleted(openers, 'None yet.')}

# Ending
When they want to go, close warmly with something specific to look forward to next time, then use the end_call tool.`

  return {
    firstMessage: nextOpener ?? returningMessage,
    prompt,
  }
}
