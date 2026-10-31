import { BlurRise } from '@demo-project/web/components/text/BlurRise'

type Props = {
  name: string
}

const periodOf = (hour: number) => {
  const afternoon = hour < 18 ? 'afternoon' : 'evening'

  return hour < 12 ? 'morning' : afternoon
}

export const Greeting: React.FC<Props> = ({ name }) => {
  const text = `Good ${periodOf(new Date().getHours())}, ${name}`

  // Keyed on the text so switching users replays the reveal.
  return (
    <BlurRise
      as='h1'
      className='text-center font-semibold text-2xl tracking-tight md:text-3xl md:leading-tight'
      key={text}
      text={text}
    />
  )
}
