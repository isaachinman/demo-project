const calculateTime = (m: number) => (n: number) => Math.round(n * m)

export const toMS = {
  days: calculateTime(864e5),
  hours: calculateTime(36e5),
  minutes: calculateTime(6e4),
  months: calculateTime(26_298e5),
  seconds: calculateTime(1e3),
  weeks: calculateTime(6048e5),
  years: calculateTime(315_576e5),
}
