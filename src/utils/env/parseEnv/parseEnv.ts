import { v } from '@demo-project/lib'

// Valibot issues carry their input, here the whole environment, so a thrown ValiError printed
// every secret into the crash log. Report only which variables failed and what was expected.
const problem = (issue: v.BaseIssue<unknown>) =>
  issue.input === undefined ? 'missing' : `expected ${issue.expected ?? issue.type}`

const describe = (issue: v.BaseIssue<unknown>) => `${v.getDotPath(issue) ?? 'environment'} (${problem(issue)})`

const invalid = (issues: v.BaseIssue<unknown>[]): never => {
  throw new Error(`Invalid environment: ${issues.map(describe).join(', ')}`)
}

export const parseEnv = <T extends v.GenericSchema>(schema: T, env: Record<string, string | undefined>) => {
  const result = v.safeParse(schema, env)

  return result.success ? result.output : invalid(result.issues)
}
