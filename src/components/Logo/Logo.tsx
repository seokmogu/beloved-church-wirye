import clsx from 'clsx'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className, loading = 'lazy' } = props

  return (
    <div className={clsx('flex items-center', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-beloved.png"
        alt="사랑하는교회 BELOVED"
        loading={loading}
        className="h-8 w-auto object-contain brightness-0 invert"
      />
    </div>
  )
}
