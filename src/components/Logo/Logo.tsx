import clsx from 'clsx'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <div className={clsx('flex flex-col leading-none', className)}>
      <span className="text-lg font-bold text-foreground">사랑하는교회</span>
      <span className="text-[10px] text-muted-foreground tracking-wider">BELOVED CHURCH WIRYE</span>
    </div>
  )
}
