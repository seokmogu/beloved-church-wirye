import clsx from 'clsx'
import Image from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className, loading = 'lazy', priority = 'auto' } = props

  return (
    <div className={clsx('flex items-center', className)}>
      <Image
        src="/logo-beloved.png"
        alt="사랑하는교회 BELOVED"
        width={120}
        height={40}
        loading={loading === 'eager' ? 'eager' : 'lazy'}
        priority={priority === 'high'}
        className="h-8 w-auto object-contain"
      />
    </div>
  )
}
