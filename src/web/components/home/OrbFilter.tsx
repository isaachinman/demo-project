type Props = {
  id: string
  blur: number
}

// devl's goo filter: blur the blobs together, then snap the alpha back to a hard edge.
export const OrbFilter: React.FC<Props> = ({ id, blur }) => (
  <svg
    aria-hidden
    className='absolute size-0'
  >
    <filter
      colorInterpolationFilters='sRGB'
      height='300%'
      id={id}
      width='300%'
      x='-100%'
      y='-100%'
    >
      <feGaussianBlur
        in='SourceGraphic'
        result='shape-blur'
        stdDeviation={blur}
      />
      <feColorMatrix
        in='shape-blur'
        result='shape'
        values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11'
      />
      <feGaussianBlur
        in='SourceGraphic'
        result='tint-blur'
        stdDeviation={blur * 1.6}
      />
      <feColorMatrix
        in='tint-blur'
        result='tint'
        values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 0'
      />
      <feComposite
        in='tint'
        in2='shape'
        operator='in'
      />
    </filter>
  </svg>
)
