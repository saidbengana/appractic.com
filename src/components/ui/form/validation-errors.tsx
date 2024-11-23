interface ValidationErrorsProps {
  errors: Record<string, string>
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  const hasErrors = Object.keys(errors).length > 0

  if (!hasErrors) return null

  return (
    <div>
      <div className="font-medium text-red-500">
        Whoops! Something went wrong.
      </div>

      <ul className="mt-2 list-disc list-inside text-sm text-red-500">
        {Object.entries(errors).map(([key, error]) => (
          <li key={key}>{error}</li>
        ))}
      </ul>
    </div>
  )
}
