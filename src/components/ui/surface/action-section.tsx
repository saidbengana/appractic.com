import { ReactNode } from 'react'
import { Panel } from './panel'

interface ActionSectionProps {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
}

export function ActionSection({
  title,
  description,
  children,
}: ActionSectionProps) {
  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-1 flex justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>

          {description && (
            <p className="mt-2 text-gray-500">{description}</p>
          )}
        </div>
      </div>

      <div className="mt-6 md:mt-0 md:col-span-2">
        <Panel>{children}</Panel>
      </div>
    </div>
  )
}
