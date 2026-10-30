import { toMS } from './toMS'

describe('toMS', () => {
  describe('success cases', () => {
    const successTestCases = [
      { description: 'should convert 1 second to 1000ms', fn: toMS.seconds, input: 1, output: 1000 },
      { description: 'should convert 5 seconds to 5000ms', fn: toMS.seconds, input: 5, output: 5000 },
      { description: 'should convert 1 minute to 60000ms', fn: toMS.minutes, input: 1, output: 60_000 },
      { description: 'should convert 5 minutes to 300000ms', fn: toMS.minutes, input: 5, output: 300_000 },
      { description: 'should convert 1 hour to 3600000ms', fn: toMS.hours, input: 1, output: 3_600_000 },
      { description: 'should convert 2 hours to 7200000ms', fn: toMS.hours, input: 2, output: 7_200_000 },
      { description: 'should convert 1 day to 86400000ms', fn: toMS.days, input: 1, output: 86_400_000 },
      { description: 'should convert 7 days to 604800000ms', fn: toMS.days, input: 7, output: 604_800_000 },
      { description: 'should convert 1 week to 604800000ms', fn: toMS.weeks, input: 1, output: 604_800_000 },
      { description: 'should convert 2 weeks to 1209600000ms', fn: toMS.weeks, input: 2, output: 1_209_600_000 },
      { description: 'should handle 0 seconds', fn: toMS.seconds, input: 0, output: 0 },
      { description: 'should handle 0 minutes', fn: toMS.minutes, input: 0, output: 0 },
      { description: 'should handle fractional values', fn: toMS.seconds, input: 1.5, output: 1500 },
      { description: 'should handle fractional minutes', fn: toMS.minutes, input: 0.5, output: 30_000 },
    ]

    for (const testCase of successTestCases) {
      it(testCase.description, () => {
        expect(testCase.fn(testCase.input)).toBe(testCase.output)
      })
    }
  })
})
