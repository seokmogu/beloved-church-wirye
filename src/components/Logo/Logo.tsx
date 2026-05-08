import clsx from 'clsx'

interface Props {
  alt?: string
  className?: string
  height?: number
  inverted?: boolean
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  src?: string
}

export const Logo = (props: Props) => {
  const {
    alt = '사랑하는교회',
    className,
    height = 32,
    inverted = true,
    loading = 'lazy',
    src = '/logo-beloved.png',
  } = props

  return (
    <div className={clsx('flex items-center', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={clsx('w-auto object-contain', inverted && 'brightness-0 invert')}
        style={{ height }}
      />
    </div>
  )
}
