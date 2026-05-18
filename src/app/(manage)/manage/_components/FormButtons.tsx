'use client'

import { Save, Trash2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

export function SaveButton({ label = '저장' }: { label?: string }) {
  const { pending } = useFormStatus()

  return (
    <button className="manage-button" disabled={pending} type="submit">
      <Save />
      {pending ? '저장 중' : label}
    </button>
  )
}

export function DeleteButton({ label = '삭제' }: { label?: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      className="manage-button danger"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm('삭제할까요?')) event.preventDefault()
      }}
      type="submit"
    >
      <Trash2 />
      {pending ? '삭제 중' : label}
    </button>
  )
}
