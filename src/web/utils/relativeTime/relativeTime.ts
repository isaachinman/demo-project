import { toMS } from '@demo-project/utils/data/toMS'

const FORMAT = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' })

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', toMS.days(1)],
  ['hour', toMS.hours(1)],
  ['minute', toMS.minutes(1)],
]

// "5 min. ago", "yesterday", "3 days ago"; anything under a minute is "now".
export const relativeTime = (iso: string, now = Date.now()) => {
  const elapsed = new Date(iso).getTime() - now
  const unit = UNITS.find(([, size]) => Math.abs(elapsed) >= size)

  return unit ? FORMAT.format(Math.round(elapsed / unit[1]), unit[0]) : 'now'
}
