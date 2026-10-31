import { ownedIds } from './ownedIds'

describe('ownedIds', () => {
  it('keeps only ids the user owns, once each', () => {
    expect(ownedIds(['mine-1', 'theirs', 'mine-2', 'mine-1'], ['mine-1', 'mine-2', 'mine-3'])).toEqual([
      'mine-1',
      'mine-2',
    ])
  })

  it('returns nothing when the user owns nothing', () => {
    expect(ownedIds(['a', 'b'], [])).toEqual([])
  })
})
