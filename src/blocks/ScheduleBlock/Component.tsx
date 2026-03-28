import React from 'react'

type ScheduleItem = {
  dayTime: string
  name: string
  location?: string | null
  description?: string | null
}

type ScheduleBlockProps = {
  title?: string | null
  items?: ScheduleItem[] | null
  id?: string
}

export const ScheduleBlockComponent: React.FC<ScheduleBlockProps> = ({ title, items }) => {
  return (
    <div className="my-8">
      {title && <h3 className="mb-4 text-xl font-semibold">{title}</h3>}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <tbody>
            {items?.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-medium text-primary">{item.dayTime}</td>
                <td className="px-4 py-3 font-semibold">{item.name}</td>
                <td className="px-4 py-3 text-gray-600">{item.location}</td>
                <td className="px-4 py-3 text-gray-500">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
