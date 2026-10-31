import type { AgentContext } from '@demo-project/types'

import { buildAgentPrompt } from './buildAgentPrompt'

const NOW = new Date('2026-10-31T12:00:00Z')
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000)

const fresh: AgentContext = {
  conversations: [],
  followUps: [],
  memories: [],
  name: 'Priya',
  nextOpener: null,
  now: NOW,
}

describe('buildAgentPrompt', () => {
  it('meets a brand-new user with the first-meeting opener', () => {
    const { prompt, firstMessage } = buildAgentPrompt(fresh)

    expect(firstMessage).toBe("Hey Priya, I'm Robin. I don't think we've properly met yet. How's your day going?")
    expect(prompt).toContain('# Your goal: get to know Priya')
    expect(prompt).toContain("You've just met.")
  })

  it('opens a returning call with the generated opener and leaves out retired memory', () => {
    const { prompt, firstMessage } = buildAgentPrompt({
      ...fresh,
      conversations: [
        { opener: 'Hey Priya, how was the pottery class?', startedAt: daysAgo(2), summary: 'Talked about pottery.' },
      ],
      followUps: [
        { createdAt: daysAgo(2), question: 'Did the kiln firing work out?', resolvedAt: null },
        { createdAt: daysAgo(3), question: 'How was the dentist?', resolvedAt: daysAgo(2) },
      ],
      memories: [
        { category: 'plans', createdAt: daysAgo(2), fact: 'Priya is moving to Leeds.', supersededAt: null },
        { category: 'plans', createdAt: daysAgo(5), fact: 'Priya is moving to Bristol.', supersededAt: daysAgo(2) },
      ],
      nextOpener: 'Priya! Did the kiln firing survive?',
    })

    expect(firstMessage).toBe('Priya! Did the kiln firing survive?')
    expect(prompt).toContain('plans:\n- Priya is moving to Leeds.')
    expect(prompt).not.toContain('Bristol')
    expect(prompt).toContain('- Did the kiln firing work out?')
    expect(prompt).not.toContain('dentist')
    expect(prompt).toContain('- 2 days ago: Talked about pottery.')
    expect(prompt).toContain('- Hey Priya, how was the pottery class?')
  })

  it('falls back to a generic returning opener when no opener was generated', () => {
    const { firstMessage } = buildAgentPrompt({
      ...fresh,
      conversations: [{ opener: null, startedAt: daysAgo(1), summary: null }],
    })

    expect(firstMessage).toBe("Hey Priya, good to hear from you again. What's been going on?")
  })

  it('caps memories at the newest 60 and follow-ups at 3', () => {
    const { prompt } = buildAgentPrompt({
      ...fresh,
      followUps: Array.from({ length: 5 }, (_, i) => ({
        createdAt: daysAgo(i),
        question: `Thread ${i}?`,
        resolvedAt: null,
      })),
      memories: Array.from({ length: 70 }, (_, i) => ({
        category: 'interests',
        createdAt: daysAgo(i),
        fact: `Fact number ${i}.`,
        supersededAt: null,
      })),
    })

    expect(prompt).toContain('Fact number 59.')
    expect(prompt).not.toContain('Fact number 60.')
    expect(prompt).toContain('Thread 2?')
    expect(prompt).not.toContain('Thread 3?')
  })
})
