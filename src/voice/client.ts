import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

import { config } from '@demo-project/config'

// Minting a conversation token sits on the tap-to-talk path, so fail fast rather than retrying.
export const elevenlabs = new ElevenLabsClient({
  apiKey: config.ELEVENLABS_API_KEY ?? 'missing',
  maxRetries: 0,
  timeoutInSeconds: 5,
})
