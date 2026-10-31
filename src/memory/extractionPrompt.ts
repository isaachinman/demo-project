import { AGENT_NAME } from '@demo-project/constants'

import type { ExtractionInput } from './extractionSchema'

export const EXTRACTION_SYSTEM = `You maintain the long-term memory of ${AGENT_NAME}, a voice companion whose goal is to get to know one person over many calls.

You receive what ${AGENT_NAME} already knows, the open follow-ups, previous call openers, and the transcript of the call that just ended. Return:

- newMemories: only facts the user stated or clearly implied in this call. One atomic fact each, specific (names, dates, places, numbers), third person. Never repeat a known fact. Never infer sensitive traits (health, religion, sexuality, politics, ethnicity) unless the user said them outright. Never record anything ${AGENT_NAME} said about itself.
- supersededMemoryIds: ids of known facts this call contradicted or made out of date. If the user corrects a fact, supersede the old one and add the corrected fact to newMemories.
- resolvedFollowUpIds: ids of open follow-ups that were asked or answered in this call.
- followUps: at most 3 open threads worth returning to next time: upcoming events ("How did the interview go?"), half-told stories, people mentioned in passing. Never a question whose answer is already known.
- summary: two or three sentences in the third person about what was talked about.
- opener: one or two spoken sentences ${AGENT_NAME} will say to open the next call. It must reference something specific from the user's life, sound like a friend picking up where you left off, and must not resemble any previous opener in wording or topic.

Refer to the user by name or as they/them; never infer their gender. Use only ids that appear in the input. Return empty arrays when nothing applies.`

const list = (lines: string[]) => (lines.length > 0 ? lines.join('\n') : '(none)')

export const extractionPrompt = ({ name, memories, followUps, previousOpeners, transcript }: ExtractionInput) =>
  `The user's name is ${name}.

## Known facts (id: category: fact)
${list(memories.map(({ id, category, fact }) => `${id}: ${category}: ${fact}`))}

## Open follow-ups (id: question)
${list(followUps.map(({ id, question }) => `${id}: ${question}`))}

## Previous openers
${list(previousOpeners)}

## Transcript of the call that just ended
${transcript.map(({ role, message }) => `${role === 'agent' ? AGENT_NAME : name}: ${message}`).join('\n')}`
