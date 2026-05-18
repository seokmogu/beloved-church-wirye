const koreaTimeZone = 'Asia/Seoul'

export function formatKoreanDate(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: koreaTimeZone,
    year: 'numeric',
  }).format(date)
}

export function toDateInputValue(value: string | null | undefined): string {
  return formatParts(value, false)
}

export function toDateTimeInputValue(value: string | null | undefined): string {
  return formatParts(value, true)
}

export function dateInputToISO(
  value: string,
  options?: { endOfDay?: boolean; fallback?: Date },
): string {
  const fallback = options?.fallback || new Date()

  if (!value) return fallback.toISOString()

  const time = value.includes('T')
    ? value.length === 16
      ? `${value}:00`
      : value
    : `${value}T${options?.endOfDay ? '23:59:59' : '00:00:00'}`

  const date = new Date(`${time}+09:00`)
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString()
}

function formatParts(value: string | null | undefined, includeTime: boolean): string {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return ''

  const formatter = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    hour: includeTime ? '2-digit' : undefined,
    hour12: false,
    minute: includeTime ? '2-digit' : undefined,
    month: '2-digit',
    timeZone: koreaTimeZone,
    year: 'numeric',
  })

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  )
  const datePart = `${parts.year}-${parts.month}-${parts.day}`

  if (!includeTime) return datePart

  return `${datePart}T${parts.hour}:${parts.minute}`
}
