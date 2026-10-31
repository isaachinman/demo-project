import { memoryCategory } from '@demo-project/db/schema'
import { v } from '@demo-project/lib'

export const ExtractionResult = v.object({
  followUps: v.pipe(
    v.array(
      v.object({
        question: v.pipe(v.string(), v.description('A natural question to ask next time, in the agent’s voice.')),
        why: v.pipe(v.string(), v.description('What was said that makes this worth returning to.')),
      }),
    ),
    // Not v.maxLength: strict structured outputs reject array size limits, so the apply step caps it instead.
    v.description('At most 3 open threads worth returning to. Never a question whose answer is already known.'),
  ),
  newMemories: v.pipe(
    v.array(
      v.object({
        category: v.picklist(memoryCategory.enumValues),
        fact: v.pipe(v.string(), v.description('One atomic, specific fact, written in the third person.')),
      }),
    ),
    v.description('Facts learned in this call that are not already known.'),
  ),
  opener: v.pipe(
    v.string(),
    v.description('One or two spoken sentences to open the next call; specific, and unlike every previous opener.'),
  ),
  resolvedFollowUpIds: v.pipe(
    v.array(v.string()),
    v.description('Ids of open follow-ups asked or answered in this call.'),
  ),
  summary: v.pipe(v.string(), v.description('Two or three sentences, third person, summarising this call.')),
  supersededMemoryIds: v.pipe(
    v.array(v.string()),
    v.description('Ids of known facts this call contradicted or made out of date.'),
  ),
})

export type ExtractionResult = v.InferOutput<typeof ExtractionResult>

export type MemoryCategory = (typeof memoryCategory.enumValues)[number]

export type ExtractionInput = {
  name: string
  memories: { id: string; category: MemoryCategory; fact: string }[]
  followUps: { id: string; question: string }[]
  previousOpeners: string[]
  transcript: { role: 'user' | 'agent'; message: string }[]
}
