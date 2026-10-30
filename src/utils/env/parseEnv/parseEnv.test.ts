import { v } from '@demo-project/lib'

import { parseEnv } from './parseEnv'

const Env = v.object({ LOGIN_USER: v.pipe(v.string(), v.email()), SECRET: v.pipe(v.string(), v.minLength(32)) })

describe('parseEnv', () => {
  it('names the failing variables without echoing any value', () => {
    const env = { LOGIN_USER: 'not-an-email-leak', OTHER_KEY: 'unrelated-secret-leak', SECRET: 'short-leak' }

    expect(() => parseEnv(Env, env)).toThrow(/LOGIN_USER.*SECRET/)
    expect(() => parseEnv(Env, env)).not.toThrow(/leak/)
  })
})
