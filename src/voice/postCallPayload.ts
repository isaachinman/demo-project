import { v } from '@demo-project/lib'

// Only the fields we store from ElevenLabs' post_call_transcription webhook. Everything else is ignored.

const Metric = v.optional(
  v.object({
    elapsed_time: v.number(),
  }),
)

const Turn = v.object({
  conversation_turn_metrics: v.nullish(
    v.object({
      metrics: v.nullish(
        v.object({
          convai_llm_service_ttf_sentence: Metric,
          convai_llm_service_ttfb: Metric,
        }),
      ),
    }),
  ),
  message: v.nullable(v.string()),
  role: v.picklist(['user', 'agent']),
  time_in_call_secs: v.number(),
})

export const PostCallTranscription = v.object({
  data: v.object({
    conversation_id: v.string(),
    metadata: v.object({
      call_duration_secs: v.number(),
      start_time_unix_secs: v.number(),
    }),
    transcript: v.array(Turn),
    user_id: v.pipe(v.string(), v.uuid()),
  }),
  type: v.literal('post_call_transcription'),
})

export type PostCallTranscription = v.InferOutput<typeof PostCallTranscription>
